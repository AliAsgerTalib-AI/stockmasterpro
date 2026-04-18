import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError, OperationType, isConfigured } from '../lib/supabase';
import { Category } from '../types';
import { toCamelCase, toSnakeCase } from '../lib/utils';
import { toast } from 'sonner';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_CATEGORIES } from '../lib/mockData';

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      if (!isConfigured) return MOCK_CATEGORIES;
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return toCamelCase(data || []) as Category[];
    }
  });

  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('categories-crud-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const addCategory = async (name: string, description?: string) => {
    try {
      const { error } = await supabase.from('categories').insert([toSnakeCase({ name, description })]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      toast.success('Category added');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.CREATE, 'categories');
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase.from('categories').update(toSnakeCase({ name, description })).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      toast.success('Category updated');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.UPDATE, 'categories');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      toast.success('Category deleted');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.DELETE, 'categories');
      return false;
    }
  };

  return { 
    categories: categoriesQuery.data || [], 
    loading: categoriesQuery.isLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    refresh: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories }) 
  };
}
