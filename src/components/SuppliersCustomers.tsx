import React, { useState } from 'react';
import { supabase, handleSupabaseError, OperationType } from '../lib/supabase';
import { useSuppliersCustomers } from '../hooks/useSuppliersCustomers';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin,
  Building2,
  Users
} from 'lucide-react';
import { PageHeader } from './layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function SuppliersCustomers() {
  const { suppliers, customers, loading, deleteContact } = useSuppliersCustomers();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers'>('suppliers');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = activeTab === 'suppliers' ? {
        name: formData.name,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      } : {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      };

      if (editingContact) {
        const { error } = await supabase.from(activeTab).update(payload).eq('id', editingContact.id);
        if (error) throw error;
        toast.success('Contact updated');
      } else {
        const { error } = await supabase.from(activeTab).insert([payload]);
        if (error) throw error;
        toast.success('Contact added');
      }
      setIsAddDialogOpen(false);
      setEditingContact(null);
      resetForm();
    } catch (error: any) {
      handleSupabaseError(error, editingContact ? OperationType.UPDATE : OperationType.CREATE, activeTab);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you wish to dissolve this partnership?')) return;
    const success = await deleteContact(activeTab, id);
    if (success) toast.success('Partnership dissolved');
  };

  const resetForm = () => setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });

  const filteredContacts = (activeTab === 'suppliers' ? suppliers : customers).filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-48 flex items-center justify-center font-serif italic text-lg opacity-50">Mapping the network...</div>;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <PageHeader title="The Network" subtitle="Strategic Partnerships & Clientele">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
          <Tabs defaultValue="suppliers" className="w-full sm:w-auto" onValueChange={(v) => setActiveTab(v as 'suppliers' | 'customers')}>
            <TabsList className="bg-muted/50 p-1 rounded-none border border-border">
              <TabsTrigger value="suppliers" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-background text-[10px] uppercase tracking-[2px] font-bold px-6">Suppliers</TabsTrigger>
              <TabsTrigger value="customers" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-background text-[10px] uppercase tracking-[2px] font-bold px-6">Customers</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-primary hover:bg-accent text-background text-xs uppercase tracking-[2px] font-bold px-8 h-12 transition-all">
                <Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'suppliers' ? 'Supplier' : 'Customer'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-background border-2 border-primary rounded-none shadow-[20px_20px_0px_rgba(26,26,26,0.1)]">
              <DialogHeader><DialogTitle className="font-serif italic text-3xl">New {activeTab === 'suppliers' ? 'Supplier' : 'Customer'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="editorial-label">Entity Name</Label>
                  <Input required className="rounded-none border-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="editorial-label">Primary Contact</Label>
                    <Input className="rounded-none border-primary" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="editorial-label">Phone Line</Label>
                    <Input className="rounded-none border-primary" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="editorial-label">Email Address</Label>
                  <Input type="email" className="rounded-none border-primary" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="editorial-label">Physical Address</Label>
                  <Input className="rounded-none border-primary" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <DialogFooter className="pt-4"><Button type="submit" className="w-full rounded-none bg-primary hover:bg-accent text-background uppercase tracking-[2px] font-bold h-12">Record Partnership</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border"><p className="font-serif text-2xl italic text-muted-foreground">No records in the registry.</p></div>
        ) : (
          filteredContacts.map((item) => (
            <div key={item.id} className="group relative bg-white border border-border p-8 transition-all hover:border-primary hover:shadow-[10px_10px_0px_rgba(26,26,26,0.05)]">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-primary p-3 shrink-0">
                  {activeTab === 'suppliers' ? <Building2 className="h-6 w-6 text-background" /> : <Users className="h-6 w-6 text-background" />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-primary hover:text-background" onClick={() => { setEditingContact(item); setFormData({ name: item.name, contactPerson: (item as any).contactPerson || '', phone: item.phone || '', email: item.email || '', address: item.address || '' }); setIsAddDialogOpen(true); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-accent hover:text-background" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <div><h3 className="font-serif text-2xl italic mb-1">{item.name}</h3><p className="text-[10px] uppercase tracking-[2px] font-bold text-muted-foreground">{item.contactPerson || 'No Primary Contact'}</p></div>
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest font-bold"><Mail className="h-3 w-3 text-accent" /> {item.email || 'N/A'}</div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest font-bold"><Phone className="h-3 w-3 text-accent" /> {item.phone || 'N/A'}</div>
                  <div className="flex items-start gap-3 text-[11px] text-muted-foreground uppercase tracking-widest font-bold"><MapPin className="h-3 w-3 text-accent shrink-0" /><span className="leading-relaxed">{item.address || 'No Address Provided'}</span></div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border flex justify-between items-center"><span className="text-[9px] uppercase tracking-[2px] font-black text-primary">Active Account</span><Button variant="link" className="p-0 h-auto text-[10px] uppercase tracking-[2px] font-bold text-accent underline underline-offset-4">View Ledger</Button></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

