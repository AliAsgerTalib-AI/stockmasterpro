import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../lib/supabase';
import { Product, Category } from '../types';
import { toCamelCase } from '../lib/utils';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData';

export function useInventory() {
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

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      if (!isConfigured) return MOCK_CATEGORIES;
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return toCamelCase(data || []) as Category[];
    }
  });

  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('inventory-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return { 
    products: productsQuery.data || [], 
    categories: categoriesQuery.data || [], 
    loading: productsQuery.isLoading || categoriesQuery.isLoading,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    }
  };
}
