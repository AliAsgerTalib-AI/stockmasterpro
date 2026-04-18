import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../lib/supabase';
import { Product, Transaction, StockMovement } from '../types';
import { toCamelCase } from '../lib/utils';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_MOVEMENTS } from '../lib/mockData';

export function useDashboard() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: async () => {
      if (!isConfigured) return MOCK_PRODUCTS;
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Product[];
    }
  });

  const transactionsQuery = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      if (!isConfigured) return MOCK_TRANSACTIONS;
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return toCamelCase(data || []) as Transaction[];
    }
  });

  const movementsQuery = useQuery({
    queryKey: QUERY_KEYS.movements,
    queryFn: async () => {
      if (!isConfigured) return MOCK_MOVEMENTS;
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return toCamelCase(data || []) as StockMovement[];
    }
  });

  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.movements });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const isLoading = productsQuery.isLoading || transactionsQuery.isLoading || movementsQuery.isLoading;

  return { 
    products: productsQuery.data || [], 
    transactions: transactionsQuery.data || [], 
    movements: movementsQuery.data || [], 
    loading: isLoading, 
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.movements });
    }
  };
}
