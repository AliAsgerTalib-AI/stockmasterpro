import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../lib/supabase';
import { Transaction, Product, Supplier, Customer } from '../types';
import { toCamelCase } from '../lib/utils';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_TRANSACTIONS, MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_CUSTOMERS } from '../lib/mockData';

export function useTransactions() {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      if (!isConfigured) return MOCK_TRANSACTIONS;
      const { data, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .order('date', { ascending: false });
      if (error) throw error;
      return toCamelCase(data || []) as Transaction[];
    }
  });

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: async () => {
      if (!isConfigured) return MOCK_PRODUCTS;
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Product[];
    }
  });

  const suppliersQuery = useQuery({
    queryKey: QUERY_KEYS.suppliers,
    queryFn: async () => {
      if (!isConfigured) return MOCK_SUPPLIERS;
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Supplier[];
    }
  });

  const customersQuery = useQuery({
    queryKey: QUERY_KEYS.customers,
    queryFn: async () => {
      if (!isConfigured) return MOCK_CUSTOMERS;
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Customer[];
    }
  });

  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('transaction-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const isLoading = 
    transactionsQuery.isLoading || 
    productsQuery.isLoading || 
    suppliersQuery.isLoading || 
    customersQuery.isLoading;

  return { 
    transactions: transactionsQuery.data || [], 
    products: productsQuery.data || [], 
    suppliers: suppliersQuery.data || [], 
    customers: customersQuery.data || [], 
    loading: isLoading, 
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    }
  };
}
