import React, { useState } from 'react';
import { useUnits } from '../hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Ruler } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function UnitManager() {
  const { units, addUnit, updateUnit, deleteUnit, loading } = useUnits();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleEdit = (unit: any) => {
    setEditingId(unit.id);
    setFormData({ name: unit.name, abbreviation: unit.abbreviation, description: unit.description || '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', abbreviation: '', description: '' });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-background text-[10px] uppercase tracking-[2px] font-bold px-6 h-12 transition-all">
            <Ruler className="h-4 w-4 mr-2" /> Manage Units
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] bg-background border-2 border-primary rounded-none shadow-[20px_20px_0px_rgba(26,26,26,0.1)]">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-3xl">Registry Units</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 border-b border-border pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="editorial-label">Unit Name</Label>
              <Input 
                required 
                placeholder="e.g. Kilograms"
                className="rounded-none border-primary focus-visible:ring-accent"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="editorial-label">Abbreviation</Label>
              <Input 
                required 
                placeholder="e.g. kg"
                className="rounded-none border-primary focus-visible:ring-accent font-mono uppercase"
                value={formData.abbreviation} 
                onChange={(e) => setFormData({...formData, abbreviation: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="editorial-label">Description (Optional)</Label>
            <Input 
              placeholder="Primary weight measurement..."
              className="rounded-none border-primary focus-visible:ring-accent"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 rounded-none bg-primary hover:bg-accent text-background uppercase tracking-[2px] font-bold h-10">
              {editingId ? 'Update Unit' : 'Add to Collection'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel} className="rounded-none border-primary uppercase tracking-[2px] font-bold h-10">
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="max-h-[300px] overflow-y-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="editorial-table-header">Unit</TableHead>
                <TableHead className="editorial-table-header text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={2} className="text-center py-4 italic font-serif">Updating records...</TableCell></TableRow>
              ) : units.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center py-4 italic font-serif opacity-50">No units found.</TableCell></TableRow>
              ) : (
                units.map(unit => (
                  <TableRow key={unit.id} className="border-b border-border hover:bg-white group">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-serif italic text-lg">{unit.name}</p>
                        <span className="bg-muted px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider">{unit.abbreviation}</span>
                      </div>
                      {unit.description && <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{unit.description}</p>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary hover:text-background rounded-none" onClick={() => handleEdit(unit)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent hover:text-background rounded-none" onClick={() => { if(confirm('Delete unit?')) deleteUnit(unit.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
