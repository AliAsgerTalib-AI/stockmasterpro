import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { PageHeader } from './layout/PageHeader';

export default function Dashboard() {
  const { products, transactions, movements, loading } = useDashboard();

  if (loading) return <div className="h-48 flex items-center justify-center font-serif italic text-lg opacity-50">Gathering indices...</div>;

  // Calculations
  const totalStockValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel).length;
  const todaySales = transactions
    .filter(t => t.type === 'Sale' && new Date(t.date).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + t.totalAmount, 0);

  // Chart Data
  const stockTrendData = movements.slice(0, 7).reverse().map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    qty: m.balanceQty
  }));

  const topProductsData = products
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5)
    .map(p => ({ name: p.name, stock: p.currentStock }));

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="The Figures" 
        subtitle={`Fiscal Overview / ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} 
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <MetricCard title="Total Asset Valuation" value={`$${(totalStockValue / 1000000).toFixed(2)}M`} icon={DollarSign} />
        <MetricCard title="Active Stock Units" value={products.reduce((acc, p) => acc + p.currentStock, 0).toLocaleString()} icon={Package} />
        <MetricCard title="Critical Alerts" value={lowStockItems.toString()} icon={AlertTriangle} color="text-accent" />
        <MetricCard title="Today's Sales" value={`$${todaySales.toLocaleString()}`} icon={TrendingUp} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h2 className="editorial-h2">Stock Movement</h2>
          <div className="h-[300px] border-t border-primary pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e0dfdb" />
                <XAxis dataKey="date" axisLine={{ stroke: '#1a1a1a', strokeWidth: 1 }} tickLine={false} tick={{fontSize: 10, fill: '#757575', fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#757575', fontWeight: 700}} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', color: '#f4f3ef', border: 'none', borderRadius: '0px' }} itemStyle={{ color: '#f4f3ef' }} />
                <Line type="stepAfter" dataKey="qty" stroke="#1a1a1a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#d44d2e', stroke: '#d44d2e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className="editorial-h2">Top Inventory</h2>
          <div className="h-[300px] border-t border-primary pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="0" horizontal={false} stroke="#e0dfdb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={{ stroke: '#1a1a1a', strokeWidth: 1 }} tickLine={false} tick={{fontSize: 10, fill: '#757575', fontWeight: 700}} width={100} />
                <Tooltip cursor={{fill: '#e2e1dd'}} contentStyle={{ backgroundColor: '#1a1a1a', color: '#f4f3ef', border: 'none', borderRadius: '0px' }} />
                <Bar dataKey="stock" fill="#1a1a1a" radius={0} barSize={12}>
                  {topProductsData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#d44d2e' : '#1a1a1a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Recent Activity */}
      <section>
        <div className="flex justify-between items-baseline border-b border-primary pb-4 mb-6">
          <h2 className="editorial-h2 mb-0">Recent Movements</h2>
          <button className="text-[10px] uppercase tracking-[2px] font-bold text-primary underline decoration-accent underline-offset-4">View Full Ledger</button>
        </div>
        <div className="space-y-0">
          {transactions.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground italic font-serif">No movements recorded in this period.</p>
          ) : (
            <div className="border-t border-border">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-6 border-b border-border group hover:bg-white transition-colors px-4">
                  <div className="flex items-center gap-8">
                    <div className="text-[10px] uppercase tracking-[2px] font-bold text-muted-foreground w-24">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <p className="font-serif text-lg italic">{t.type} Order</p>
                      <p className="text-[10px] uppercase tracking-[1px] text-muted-foreground font-bold">Ref: {t.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="font-serif text-2xl tracking-tight">${t.totalAmount?.toLocaleString()}</p>
                      <span className={`text-[9px] uppercase tracking-[2px] font-black ${
                        t.status === 'Completed' ? 'text-primary' : 
                        t.status === 'Pending' ? 'text-muted-foreground' : 'text-accent'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className={`p-2 ${t.type === 'Purchase' ? 'text-primary' : 'text-accent'}`}>
                      {t.type === 'Purchase' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, color = "text-primary" }: any) {
  return (
    <div className="group">
      <div className="editorial-label mb-3">{title}</div>
      <div className={`editorial-stat ${color}`}>{value}</div>
      <div className="h-[2px] bg-primary w-12 group-hover:w-full transition-all duration-500"></div>
    </div>
  );
}

