import { supabase } from '../lib/supabase';

export interface TransactionCreateData {
  type: 'Purchase' | 'Sale';
  entityId: string;
  notes?: string;
  date: Date;
  userId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const TransactionService = {
  /**
   * Records a complete transaction including line items and stock updates.
   * In a production environment, this would ideally be a database transaction (RPC).
   */
  async createTransaction(data: TransactionCreateData) {
    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    // 1. Create the Transaction Header
    const { data: transHeader, error: transError } = await supabase.from('transactions').insert([{
      type: data.type,
      date: data.date.toISOString(),
      entity_id: data.entityId,
      total_amount: totalAmount,
      status: 'Completed',
      notes: data.notes,
      user_id: data.userId
    }]).select().single();
    
    if (transError) throw transError;

    // 2. Process each item and update stock
    for (const item of data.items) {
      // 2.a Create Line Item
      const { error: itemError } = await supabase.from('transaction_items').insert([{
        transaction_id: transHeader.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        amount: item.quantity * item.unitPrice
      }]);
      if (itemError) throw itemError;

      // 2.b Fetch Current Stock
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('current_stock, name')
        .eq('id', item.productId)
        .single();
      if (prodError) throw prodError;

      // 2.c Stock Logic
      const newStock = data.type === 'Purchase' 
        ? product.current_stock + item.quantity 
        : product.current_stock - item.quantity;
      
      if (data.type === 'Sale' && newStock < 0) {
        throw new Error(`Insufficient inventory for "${product.name}". Required: ${item.quantity}, Available: ${product.current_stock}`);
      }

      // 2.d Update Inventory
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.productId);
      if (updateError) throw updateError;

      // 2.e Record Stock Movement
      const { error: moveError } = await supabase.from('stock_movements').insert([{
        product_id: item.productId,
        date: data.date.toISOString(),
        type: data.type,
        qty_in: data.type === 'Purchase' ? item.quantity : 0,
        qty_out: data.type === 'Sale' ? item.quantity : 0,
        balance_qty: newStock,
        reference_id: transHeader.id
      }]);
      if (moveError) throw moveError;
    }

    return transHeader;
  }
};
