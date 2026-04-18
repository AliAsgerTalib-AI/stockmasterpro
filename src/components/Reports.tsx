import React from 'react';
import { useReports } from '../hooks/useReports';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Package, 
  ArrowRight
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from './layout/PageHeader';

export default function Reports() {
  const { products, transactions, units, loading } = useReports();

  if (loading) return <div className="h-48 flex items-center justify-center font-serif italic text-lg opacity-50">Indexing archives...</div>;

  const totalStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel);
  const totalSales = transactions.filter(t => t.type === 'Sale').reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const totalPurchases = transactions.filter(t => t.type === 'Purchase').reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="The Archive" 
        subtitle="Analytical Reports & Financial Summaries"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Financial Summary */}
        <section className="space-y-8">
          <div className="flex justify-between items-baseline border-b border-primary pb-3">
            <h3 className="editorial-h2 text-2xl mb-0">Financial Position</h3>
            <div className="text-[9px] uppercase tracking-[2px] font-black text-accent">Real-time</div>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <ReportStat label="Total Inventory Asset Value" value={`$${totalStockValue.toLocaleString()}`} />
            <ReportStat label="Total Revenue (Sales)" value={`$${totalSales.toLocaleString()}`} />
            <ReportStat label="Total Procurement (Purchases)" value={`$${totalPurchases.toLocaleString()}`} />
          </div>
        </section>

        {/* Low Stock Report */}
        <section className="space-y-8">
          <div className="flex justify-between items-baseline border-b border-primary pb-3">
            <h3 className="editorial-h2 text-2xl mb-0">Critical Stock</h3>
            <div className="text-[9px] uppercase tracking-[2px] font-black text-accent">Alerts: {lowStockItems.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="editorial-table-header">Product</TableHead>
                  <TableHead className="editorial-table-header text-right">Current</TableHead>
                  <TableHead className="editorial-table-header text-right">Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic font-serif">All stock levels are healthy.</TableCell>
                  </TableRow>
                ) : (
                  lowStockItems.map(p => {
                    const unitAbbr = units.find(u => u.id === p.unitId)?.abbreviation || p.unit || 'UNIT';
                    return (
                      <TableRow key={p.id} className="border-b border-border hover:bg-white transition-colors">
                        <TableCell className="py-4 font-serif italic text-lg">{p.name}</TableCell>
                        <TableCell className="text-right font-serif text-xl text-accent">
                          {p.currentStock} <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">{unitAbbr}</span>
                        </TableCell>
                        <TableCell className="text-right text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          {p.minStockLevel} {unitAbbr}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* Report Actions */}
      <section className="pt-12 border-t-2 border-primary">
        <h3 className="editorial-h2 mb-8">Export Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ReportActionCard 
            title="Inventory Audit" 
            description="Complete list of all stock items with current valuations and SKU codes."
            icon={FileText}
          />
          <ReportActionCard 
            title="Sales Ledger" 
            description="Detailed transaction history of all sales orders for the current period."
            icon={TrendingUp}
          />
          <ReportActionCard 
            title="Supplier Analysis" 
            description="Performance metrics and procurement history for all active suppliers."
            icon={Package}
          />
        </div>
      </section>
    </div>
  );
}

function ReportStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="group">
      <p className="editorial-label mb-2">{label}</p>
      <p className="editorial-stat text-primary">{value}</p>
      <div className="h-[1px] bg-primary/20 w-full mt-4"></div>
    </div>
  );
}

function ReportActionCard({ title, description, icon: Icon }: any) {
  return (
    <div className="group p-8 border border-border hover:border-primary transition-all cursor-pointer bg-white hover:shadow-[15px_15px_0px_rgba(212,77,46,0.1)]">
      <div className="flex items-center justify-between mb-6">
        <div className="bg-primary p-3 group-hover:bg-accent transition-colors">
          <Icon className="h-5 w-5 text-background" />
        </div>
        <Download className="h-4 w-4 text-muted-foreground group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
      </div>
      <h4 className="font-serif text-xl italic mb-3 group-hover:text-accent transition-colors">{title}</h4>
      <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider font-medium">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-black text-primary group-hover:translate-x-2 transition-transform">
        Generate PDF <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  );
}
