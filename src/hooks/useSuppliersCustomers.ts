import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError, OperationType, isConfigured } from '../lib/supabase';
import { Supplier, Customer } from '../types';
import { toCamelCase } from '../lib/utils';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_SUPPLIERS, MOCK_CUSTOMERS } from '../lib/mockData';

export function useSuppliersCustomers() {
  const queryClient = useQueryClient();

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
    const channel = supabase.channel('contacts-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const deleteContact = async (type: 'suppliers' | 'customers', id: string) => {
    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: type === 'suppliers' ? QUERY_KEYS.suppliers : QUERY_KEYS.customers });
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.DELETE, type);
      return false;
    }
  };

  const isLoading = suppliersQuery.isLoading || customersQuery.isLoading;

  return { 
    suppliers: suppliersQuery.data || [], 
    customers: customersQuery.data || [], 
    loading: isLoading, 
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.suppliers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
    }, 
    deleteContact 
  };
}
