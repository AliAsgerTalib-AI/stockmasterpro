import React, { useState, useEffect } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut, 
  Plus, 
  Search, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Settings,
  Ruler,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import UnitsScreen from './components/UnitsScreen';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import SuppliersCustomers from './components/SuppliersCustomers';

type Page = 'dashboard' | 'inventory' | 'transactions' | 'reports' | 'contacts';

import { 
  Routes, 
  Route, 
  Navigate, 
  NavLink,
  useLocation
} from 'react-router-dom';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const rawUrl = import.meta.env.VITE_SUPABASE_URL;
    const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isEnvSet = Boolean(
      rawUrl && 
      rawUrl !== 'undefined' && 
      rawUrl.length > 10 && 
      rawUrl.startsWith('http') &&
      rawKey &&
      rawKey !== 'undefined'
    );
    
    if (!isEnvSet) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.warn('Auth session fetch failed:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Provider Error', {
        description: 'Google Auth may not be enabled in your Supabase console. Try "Explore in Demo Mode" below.'
      });
    }
  };

  const handleDemoMode = () => {
    import('./lib/supabase').then(({ setForcedDemoMode }) => setForcedDemoMode(true));
    setUser({
      id: 'demo-user-id',
      email: 'demo@stockmaster.pro',
      user_metadata: { full_name: 'Demo Operator' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as any);
    toast.info('Entering Demo Mode', {
      description: 'You are viewing high-fidelity mockup data. Operations will not persist to the database.'
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  // Fallback for demo if ENV not set
  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isEnvSet = Boolean(
    rawUrl && 
    rawUrl !== 'undefined' && 
    rawUrl.length > 10 && 
    rawKey && 
    rawKey !== 'undefined'
  );

  if (!user && isEnvSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
        <Card className="w-full max-w-md border-zinc-200 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-zinc-900 p-3 rounded-xl w-fit mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">StockMaster Pro</CardTitle>
            <CardDescription className="text-zinc-500">
              Professional Inventory Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all"
            >
              Sign in with Google
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-50 px-2 text-zinc-400 font-medium">Or</span></div>
            </div>

            <Button 
              variant="outline"
              onClick={handleDemoMode} 
              className="w-full h-12 border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-medium rounded-lg transition-all"
            >
              Explore in Demo Mode
            </Button>

            <p className="text-xs text-center text-zinc-400 mt-2">
              {!isConfigured 
                ? "Database not configured. Using high-fidelity mockup data." 
                : "Secure access to your inventory dashboard"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If environment variables are not set, show a setup instructions screen
  if (!isEnvSet && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
        <Card className="w-full max-w-lg border-zinc-200 shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="editorial-h2">Supabase Configuration Required</h2>
            <p className="text-sm text-zinc-500 font-serif leading-relaxed">
              To activate the inventory system, please configure your Supabase connection strings in the secrets panel.
            </p>
          </div>
          
          <div className="bg-zinc-100 p-6 space-y-4 font-mono text-xs overflow-x-auto">
            <p className="text-zinc-900 font-bold">REQUIRED VARIABLES:</p>
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex flex-col gap-4">
            <Button 
              className="w-full h-12 bg-zinc-900 text-white cursor-default opacity-50"
              disabled
            >
              Awaiting Configuration...
            </Button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 transition-colors"
            >
              Clear Stale Session Data
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', path: '/inventory', label: 'Inventory', icon: Package },
    { id: 'units', path: '/units', label: 'Units', icon: Ruler },
    { id: 'transactions', path: '/transactions', label: 'Transactions', icon: ShoppingCart },
    { id: 'contacts', path: '/contacts', label: 'Suppliers & Customers', icon: Users },
    { id: 'reports', path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const currentPageTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  const displayName = user?.user_metadata?.full_name || user?.email || 'Operator';
  const photoURL = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}`;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white">
      <Toaster position="top-right" />
      
      {/* Sidebar - Minimal Editorial Style */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 bg-background border-r border-border transition-all duration-300 z-50 flex flex-col`}
      >
        <div className="p-10 flex items-center gap-3 border-b border-primary">
          <div className="bg-primary p-2 shrink-0">
            <Package className="h-6 w-6 text-background" />
          </div>
          {isSidebarOpen && <span className="font-serif italic text-2xl tracking-tight">Ledger</span>}
        </div>

        <nav className="flex-1 p-6 space-y-6 overflow-y-auto mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 transition-all group text-left ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0 group-hover:text-primary transition-colors" />
              {isSidebarOpen && (
                <span className="text-xs uppercase tracking-[2px] font-bold">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-muted-foreground hover:text-accent transition-all group"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="text-xs uppercase tracking-[2px] font-bold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header - Editorial Style */}
        <header className="sticky top-0 bg-background/90 backdrop-blur-sm border-b-2 border-primary h-24 flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-muted rounded-none text-primary"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="font-serif italic text-4xl tracking-tight capitalize">{currentPageTitle}</h1>
          </div>

          <div className="flex items-center gap-8">
            {!isConfigured && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold tracking-[2px] uppercase animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Preview Mode
              </div>
            )}
            <div className="relative hidden lg:block">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="SEARCH LEDGER..." 
                className="pl-8 w-64 bg-transparent border-none focus-visible:ring-0 text-xs uppercase tracking-widest placeholder:text-muted-foreground"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-muted-foreground/30"></div>
            </div>
            <div className="flex items-center gap-4 pl-8 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-[2px] font-bold leading-none">{displayName}</p>
                <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider">Operator ID: {user?.id.slice(0, 8)}</p>
              </div>
              <img 
                src={photoURL} 
                alt="Profile" 
                className="h-10 w-10 rounded-none border border-primary grayscale hover:grayscale-0 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/units" element={<UnitsScreen />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/contacts" element={<SuppliersCustomers />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

        {/* Footer - Editorial Style */}
        <footer className="px-10 py-8 border-t border-border flex justify-between text-[11px] text-muted-foreground uppercase tracking-[1.5px] font-medium">
          <div>System: v4.2.0-stable / StockMaster Pro</div>
          <div>Last Synced: {new Date().toLocaleString()}</div>
          <div>Operator: {user.email}</div>
        </footer>
      </main>
    </div>
  );
}

