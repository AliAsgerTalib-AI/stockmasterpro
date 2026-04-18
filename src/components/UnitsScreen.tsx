import React, { useState } from 'react';
import { useUnits } from '../hooks/useUnits';
import { PageHeader } from './layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit2, Trash2, Ruler } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export default function UnitsScreen() {
  const { units, addUnit, updateUnit, deleteUnit, loading } = useUnits();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', abbreviation: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.abbreviation) return;

    let success = false;
    if (editingId) {
      success = await updateUnit(editingId, formData.name, formData.abbreviation, formData.description);
    } else {
      success = await addUnit(formData.name, formData.abbreviation, formData.description);
    }

    if (success) {
      setFormData({ name: '', abbreviation: '', description: '' });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <PageHeader title="Measurement Registry" subtitle="Unit Definitions / Vol. 1" />
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <Card className="rounded-none border-2 border-primary shadow-[10px_10px_0px_rgba(26,26,26,0.1)]">
            <CardContent className="p-6">
              <h3 className="font-serif italic text-2xl mb-6">{editingId ? 'Modify Unit' : 'Define New Unit'}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="editorial-label text-[10px]">Full Name</Label>
                  <Input 
                    required 
                    placeholder="e.g. Kilograms"
                    className="rounded-none border-primary focus-visible:ring-accent"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="editorial-label text-[10px]">Symbol / Abbreviation</Label>
                  <Input 
                    required 
                    placeholder="e.g. kg"
                    className="rounded-none border-primary focus-visible:ring-accent font-mono uppercase"
                    value={formData.abbreviation} 
                    onChange={(e) => setFormData({...formData, abbreviation: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="editorial-label text-[10px]">Description (Optional)</Label>
                  <Input 
                    placeholder="Primary weight metric"
                    className="rounded-none border-primary focus-visible:ring-accent"
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  />
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  <Button type="submit" className="w-full rounded-none bg-primary hover:bg-accent text-background uppercase tracking-[2px] font-bold h-12">
                    {editingId ? 'Update Registry' : 'Commit to Registry'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); setFormData({name: '', abbreviation: '', description: ''}); }} className="w-full rounded-none border-primary uppercase tracking-[2px] font-bold h-12">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="editorial-table-header">Category & Symbol</TableHead>
                <TableHead className="editorial-table-header">Description</TableHead>
                <TableHead className="editorial-table-header text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="h-48 text-center text-muted-foreground italic font-serif text-lg">Updating registry...</TableCell></TableRow>
              ) : units.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="h-48 text-center text-muted-foreground italic font-serif text-lg">The registry is currently empty.</TableCell></TableRow>
              ) : (
                units.map((unit) => (
                  <TableRow key={unit.id} className="border-b border-border hover:bg-white transition-colors group">
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl italic">{unit.name}</span>
                        <span className="bg-muted px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest font-black">{unit.abbreviation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground max-w-xs">{unit.description || 'No description provided.'}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-background rounded-none" 
                          onClick={() => {
                            setEditingId(unit.id);
                            setFormData({ name: unit.name, abbreviation: unit.abbreviation, description: unit.description || '' });
                          }}
                        ><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-background rounded-none" onClick={() => { if(confirm('Delete unit?')) deleteUnit(unit.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
