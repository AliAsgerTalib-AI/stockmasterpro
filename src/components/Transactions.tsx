import React, { useState } from 'react';
import { supabase, handleSupabaseError, OperationType } from '../lib/supabase';
import { useTransactions } from '../hooks/useTransactions';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from './layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { TransactionService } from '../services/transactionService';

export default function Transactions() {
  const { transactions, products, suppliers, customers, loading, refresh } = useTransactions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'Purchase' | 'Sale'>('Sale');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const [formData, setFormData] = useState({
    entityId: '',
    date: new Date(),
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }]
  });

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0 }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) newItems[index].unitPrice = transactionType === 'Purchase' ? product.purchasePrice : product.sellingPrice;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entityId) {
      toast.error(`Please select a ${transactionType === 'Purchase' ? 'supplier' : 'customer'}`);
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Transaction must have at least one item');
      return;
    }
    if (formData.items.some(item => !item.productId)) {
      toast.error('Please select a product for all line items');
      return;
    }
    if (formData.items.some(item => item.quantity <= 0)) {
      toast.error('Quantities must be greater than zero');
      return;
    }
    if (formData.items.some(item => item.unitPrice < 0)) {
      toast.error('Unit prices cannot be negative');
      return;
    }

    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;

      await TransactionService.createTransaction({
        type: transactionType,
        date: formData.date,
        entityId: formData.entityId,
        items: formData.items,
        notes: formData.notes,
        userId: user?.id
      });

      toast.success(`${transactionType} recorded successfully`);
      setIsAddDialogOpen(false);
      resetForm();
      refresh();
    } catch (error: any) {
      console.error('Transaction Error:', error);
      toast.error(error.message || 'Failed to record transaction');
    }
  };

  const resetForm = () => setFormData({ entityId: '', date: new Date(), notes: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }] });

  if (loading) return <div className="h-48 flex items-center justify-center font-serif italic text-lg opacity-50">Auditing certificates...</div>;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <PageHeader title={transactionType === 'Sale' ? 'Sales Out' : 'Purchases In'} subtitle="Transaction Registry / Ledger Book">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setTransactionType('Sale')} className={`editorial-h2 mb-0 h-auto p-0 min-w-0 transition-all ${transactionType === 'Sale' ? 'text-primary border-b-2 border-accent' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}>Sales</Button>
          <Button variant="ghost" onClick={() => setTransactionType('Purchase')} className={`editorial-h2 mb-0 h-auto p-0 min-w-0 transition-all ${transactionType === 'Purchase' ? 'text-primary border-b-2 border-accent' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}>Purchases</Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-primary hover:bg-accent text-background text-xs uppercase tracking-[2px] font-bold px-8 h-12 transition-all">
              <Plus className="h-4 w-4 mr-2" /> New {transactionType === 'Sale' ? 'Sales' : 'Purchase'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-background border-2 border-primary rounded-none shadow-[20px_20px_0px_rgba(26,26,26,0.1)] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif italic text-3xl">Record {transactionType}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8 py-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="editorial-label">{transactionType === 'Purchase' ? 'Supplier *' : 'Customer *'}</Label>
                  <Select value={formData.entityId} onValueChange={(v) => setFormData({...formData, entityId: v})}>
                    <SelectTrigger className="rounded-none border-primary"><SelectValue placeholder={`Select...`} /></SelectTrigger>
                    <SelectContent className="bg-background border-primary rounded-none">
                      {transactionType === 'Purchase' 
                        ? suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                        : customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="editorial-label">Date of Entry *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-10 rounded-none border border-primary bg-white text-xs font-bold uppercase tracking-widest hover:bg-muted"
                      >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-none border-primary bg-background shadow-[10px_10px_0px_rgba(26,26,26,0.1)]">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-primary pb-2">
                  <Label className="editorial-label">Line Items</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-[10px] uppercase tracking-widest font-bold hover:text-accent"><Plus className="h-3 w-3 mr-1" /> Add Line</Button>
                </div>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end pb-4 border-b border-border">
                      <div className="col-span-5 space-y-2">
                        <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Product *</Label>
                        <Select value={item.productId} onValueChange={(v) => updateItem(index, 'productId', v)}>
                          <SelectTrigger className="rounded-none border-primary bg-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent className="bg-background border-primary rounded-none">
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Qty *</Label>
                        <Input type="number" min="1" className="rounded-none border-primary bg-white" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Price *</Label>
                        <Input type="number" step="0.01" min="0" className="rounded-none border-primary bg-white" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">Total</Label>
                        <div className="h-10 flex items-center font-serif text-lg italic">${(item.quantity * item.unitPrice).toLocaleString()}</div>
                      </div>
                      <div className="col-span-1"><Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Notes</Label>
                <Input className="rounded-none border-primary bg-transparent text-xs uppercase tracking-widest" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="pt-8 border-t-2 border-primary flex items-end justify-between">
                <div className="space-y-1">
                  <Label className="editorial-label text-muted-foreground">Grand Total</Label>
                  <p className="editorial-stat">${formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toLocaleString()}</p>
                </div>
                <Button type="submit" className="rounded-none bg-primary hover:bg-accent text-background uppercase tracking-[2px] font-bold h-14 px-12">Commit {transactionType}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="editorial-table-header">Date & Time</TableHead>
              <TableHead className="editorial-table-header">{transactionType === 'Purchase' ? 'Supplier' : 'Customer'}</TableHead>
              <TableHead className="editorial-table-header text-right">Total Amount</TableHead>
              <TableHead className="editorial-table-header">Status</TableHead>
              <TableHead className="editorial-table-header text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.filter(t => t.type === transactionType).length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic font-serif text-lg">No {transactionType.toLowerCase()} movements recorded.</TableCell></TableRow>
            ) : (
              transactions.filter(t => t.type === transactionType).map((t) => (
                <React.Fragment key={t.id}>
                  <TableRow 
                    className="border-b border-border hover:bg-white transition-colors group cursor-pointer"
                    onClick={() => toggleExpand(t.id)}
                  >
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        {expandedId === t.id ? <ChevronDown className="h-4 w-4 text-accent" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[2px] font-bold text-primary">{new Date(t.date).toLocaleDateString()}</p>
                          <p className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-bold">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-serif text-lg italic">{transactionType === 'Purchase' ? suppliers.find(s => s.id === t.entityId)?.name : customers.find(c => c.id === t.entityId)?.name || 'Walk-in Customer'}</p>
                      <p className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-bold">Ref: {t.id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell className="text-right"><p className="font-serif text-2xl tracking-tight text-primary">${t.totalAmount?.toLocaleString()}</p></TableCell>
                    <TableCell><div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[2px]"><CheckCircle2 className="h-3 w-3 text-accent" /> {t.status}</div></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="rounded-none text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-background transition-all">
                        {expandedId === t.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === t.id && (
                    <TableRow className="bg-muted/5 border-b border-border animate-in slide-in-from-top-1 duration-200">
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-8 space-y-6">
                          <div className="flex justify-between items-baseline border-b border-primary/20 pb-4">
                            <h4 className="editorial-label">Ordered Items</h4>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t.transactionItems?.length || 0} Positions</span>
                          </div>
                          <div className="grid grid-cols-12 gap-4 text-[9px] uppercase tracking-widest font-black text-muted-foreground/60 border-b border-border pb-2">
                            <div className="col-span-6 text-left">Product</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Unit Price</div>
                            <div className="col-span-2 text-right">Subtotal</div>
                          </div>
                          <div className="space-y-4">
                            {t.transactionItems?.map((item: any) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-6 font-serif italic text-lg leading-none">
                                    {product?.name || 'Unknown Product'}
                                    <span className="block editorial-sku mt-1">{product?.sku || 'N/A'}</span>
                                  </div>
                                  <div className="col-span-2 text-center font-serif text-xl tracking-tighter text-accent">
                                    {item.quantity}
                                  </div>
                                  <div className="col-span-2 text-right font-serif text-lg tracking-tight text-muted-foreground">
                                    ${item.unitPrice?.toLocaleString()}
                                  </div>
                                  <div className="col-span-2 text-right font-serif text-xl tracking-tight text-primary">
                                    ${item.amount?.toLocaleString()}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {t.notes && (
                            <div className="pt-6 border-t border-border mt-6">
                              <p className="editorial-label mb-2">Internal Notes</p>
                              <p className="text-xs italic text-muted-foreground leading-relaxed">"{t.notes}"</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

