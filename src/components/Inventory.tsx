import React, { useState } from 'react';
import { supabase, handleSupabaseError, OperationType } from '../lib/supabase';
import { useInventory } from '../hooks/useInventory';
import { Product } from '../types';
import { toSnakeCase } from '../lib/utils';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  unitId: z.string().min(1, 'Please select a unit'),
  unit: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  minStockLevel: z.number().min(0, 'Min stock level cannot be negative'),
  currentStock: z.number().default(0),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active')
});
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag
} from 'lucide-react';
import { PageHeader } from './layout/PageHeader';
import { CategoryManager } from './CategoryManager';
import { UnitManager } from './UnitManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function Inventory() {
  const { products, categories, units, loading } = useInventory();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitId: '',
    unit: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minStockLevel: 5,
    currentStock: 0,
    description: '',
    status: 'Active' as const
  });

  const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Professional Schema Validation
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const error = validation.error.issues[0];
      return toast.error(error.message);
    }

    try {
      const payload = toSnakeCase(formData);
      payload.updated_at = new Date().toISOString();

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product added successfully');
      }
      setIsAddDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      handleSupabaseError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
    } catch (error: any) {
      handleSupabaseError(error, OperationType.DELETE, 'products');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      unitId: '',
      unit: '',
      purchasePrice: 0,
      sellingPrice: 0,
      minStockLevel: 5,
      currentStock: 0,
      description: '',
      status: 'Active'
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-48 flex items-center justify-center font-serif italic text-lg opacity-50">Opening the ledger...</div>;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <PageHeader title="The Ledger" subtitle="Master Product Inventory / Vol. 1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH BY NAME OR SKU..." 
              className="pl-8 w-full sm:w-64 bg-transparent border-none focus-visible:ring-0 text-xs uppercase tracking-widest placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-muted-foreground/30"></div>
          </div>
          <div className="flex items-center gap-3">
            <CategoryManager />
            <UnitManager />
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) { setEditingProduct(null); resetForm(); }
            }}>
              <DialogTrigger
                render={
                  <Button className="rounded-none bg-primary hover:bg-accent text-background text-xs uppercase tracking-[2px] font-bold px-8 h-12 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Add Entry
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[600px] bg-background border-2 border-primary rounded-none shadow-[20px_20px_0px_rgba(26,26,26,0.1)]">
                <DialogHeader>
                  <DialogTitle className="font-serif italic text-3xl">{editingProduct ? 'Modify Entry' : 'New Entry'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 py-6">
              <div className="col-span-2 space-y-2">
                <Label className="editorial-label">Product Name *</Label>
                <Input required className="rounded-none border-primary focus-visible:ring-accent" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">SKU Code *</Label>
                <Input required className="rounded-none border-primary focus-visible:ring-accent font-mono" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                  <SelectTrigger className="rounded-none border-primary">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary rounded-none">
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Unit *</Label>
                <Select value={formData.unitId} onValueChange={(v) => {
                  const u = units.find(unit => unit.id === v);
                  setFormData({...formData, unitId: v, unit: u?.abbreviation || ''});
                }}>
                  <SelectTrigger className="rounded-none border-primary">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary rounded-none">
                    {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.abbreviation})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Min Stock *</Label>
                <Input type="number" min="0" required className="rounded-none border-primary focus-visible:ring-accent" value={formData.minStockLevel} onChange={(e) => setFormData({...formData, minStockLevel: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Purchase ($) *</Label>
                <Input type="number" step="0.01" min="0" required className="rounded-none border-primary focus-visible:ring-accent" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="editorial-label">Selling ($) *</Label>
                <Input type="number" step="0.01" min="0" required className="rounded-none border-primary focus-visible:ring-accent" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="editorial-label">Description</Label>
                <Input className="rounded-none border-primary focus-visible:ring-accent" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <DialogFooter className="col-span-2 mt-6">
                <Button type="submit" className="w-full rounded-none bg-primary hover:bg-accent text-background uppercase tracking-[2px] font-bold h-12">
                  {editingProduct ? 'Commit Changes' : 'Record Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        </div>
      </PageHeader>

      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="editorial-table-header w-[150px]">Product & SKU</TableHead>
              <TableHead className="editorial-table-header">Category</TableHead>
              <TableHead className="editorial-table-header text-right">Current Stock</TableHead>
              <TableHead className="editorial-table-header text-right">Valuation</TableHead>
              <TableHead className="editorial-table-header">Status</TableHead>
              <TableHead className="editorial-table-header text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-serif text-lg">The ledger is currently empty.</TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-b border-border hover:bg-white transition-colors group">
                  <TableCell className="py-6">
                    <div className="space-y-2">
                      <p className="font-serif text-lg italic leading-none">{product.name}</p>
                      <span className="editorial-sku">{product.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] uppercase tracking-[1px] font-bold text-muted-foreground">
                      {categories.find(c => c.id === product.categoryId)?.name || 'General'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-serif text-2xl tracking-tight ${product.currentStock <= product.minStockLevel ? 'text-accent' : 'text-primary'}`}>{product.currentStock}</span>
                      <span className="text-[9px] uppercase tracking-[1px] font-bold text-muted-foreground">
                        {units.find(u => u.id === product.unitId)?.abbreviation || product.unit || 'Nos'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-serif text-xl tracking-tight">${product.sellingPrice?.toLocaleString()}</p>
                    <p className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-bold">MSRP</p>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[9px] uppercase tracking-[2px] font-black ${product.status === 'Active' ? 'text-primary' : 'text-muted-foreground'}`}>{product.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-background rounded-none"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            sku: product.sku,
                            categoryId: product.categoryId || '',
                            unitId: product.unitId || '',
                            unit: product.unit || '',
                            purchasePrice: product.purchasePrice,
                            sellingPrice: product.sellingPrice,
                            minStockLevel: product.minStockLevel,
                            currentStock: product.currentStock,
                            description: product.description || '',
                            status: product.status
                          });
                          setIsAddDialogOpen(true);
                        }}
                      ><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-background rounded-none" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {lowStockItems.length > 0 && (
        <div className="editorial-box-inverted mt-12 animate-in slide-in-from-right-4 duration-1000">
          <span className="editorial-label text-background opacity-60 mb-4 block">Critical Alerts</span>
          <div className="font-serif text-2xl italic leading-relaxed">
            {lowStockItems.slice(0, 3).map((p, i) => (
              <React.Fragment key={p.id}>{p.name} ({p.currentStock} left){i < 2 && i < lowStockItems.length - 1 ? <br /> : ''}</React.Fragment>
            ))}
            {lowStockItems.length > 3 && <><br />...and {lowStockItems.length - 3} more</>}
          </div>
          <div className="mt-6 text-[10px] uppercase tracking-[2px] font-bold underline decoration-accent underline-offset-4 cursor-pointer hover:text-accent transition-colors">Generate Procurement Report</div>
        </div>
      )}
    </div>
  );
}

