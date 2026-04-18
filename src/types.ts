export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  unitId?: string;
  purchasePrice: number;
  sellingPrice: number;
  minStockLevel: number;
  currentStock: number;
  description?: string;
  status: 'Active' | 'Inactive';
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Transaction {
  id: string;
  type: 'Purchase' | 'Sale';
  date: string;
  entityId: string; // SupplierID or CustomerID
  entityName?: string;
  totalAmount: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  notes?: string;
  transactionItems?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  date: string;
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Return';
  qtyIn: number;
  qtyOut: number;
  balanceQty: number;
  referenceId: string;
}
