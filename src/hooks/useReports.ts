import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured, isDemoMode } from '../lib/supabase';
import { Product, Transaction, Category } from '../types';
import { toCamelCase } from '../lib/utils';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_CATEGORIES } from '../lib/mockData';

export function useReports() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: async () => {
      if (isDemoMode()) return MOCK_PRODUCTS;
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Product[];
    }
  });

  const transactionsQuery = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      if (isDemoMode()) return MOCK_TRANSACTIONS;
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Transaction[];
    }
  });

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      if (isDemoMode()) return MOCK_CATEGORIES;
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Category[];
    }
  });

  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('reports-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const isInitialLoading = productsQuery.isPending || transactionsQuery.isPending || categoriesQuery.isPending;

  return { 
    products: productsQuery.data || [], 
    transactions: transactionsQuery.data || [], 
    categories: categoriesQuery.data || [], 
    loading: isInitialLoading, 
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    }
  };
}
