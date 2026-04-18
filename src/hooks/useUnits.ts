import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError, OperationType, isDemoMode } from '../lib/supabase';
import { Unit } from '../types';
import { toCamelCase, toSnakeCase } from '../lib/utils';
import { toast } from 'sonner';
import { QUERY_KEYS } from '../lib/queryKeys';
import { MOCK_UNITS } from '../lib/mockData';

export function useUnits() {
  const queryClient = useQueryClient();

  const unitsQuery = useQuery({
    queryKey: QUERY_KEYS.units || ['units'],
    queryFn: async () => {
      if (isDemoMode()) return MOCK_UNITS;
      const { data, error } = await supabase.from('units').select('*').order('name');
      if (error) throw error;
      return toCamelCase(data || []) as Unit[];
    }
  });

  useEffect(() => {
    if (isDemoMode()) return;
    const channel = supabase.channel('units-crud-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.units || ['units'] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  const addUnit = async (name: string, abbreviation: string, description?: string) => {
    try {
      if (isDemoMode()) {
        toast.info('Demo Mode: Operation simulated');
        return true;
      }
      const { error } = await supabase.from('units').insert([toSnakeCase({ name, abbreviation, description })]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.units || ['units'] });
      toast.success('Unit added');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.CREATE, 'units');
      return false;
    }
  };

  const updateUnit = async (id: string, name: string, abbreviation: string, description?: string) => {
    try {
      if (isDemoMode()) {
        toast.info('Demo Mode: Operation simulated');
        return true;
      }
      const { error } = await supabase.from('units').update(toSnakeCase({ name, abbreviation, description })).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.units || ['units'] });
      toast.success('Unit updated');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.UPDATE, 'units');
      return false;
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      if (isDemoMode()) {
        toast.info('Demo Mode: Operation simulated');
        return true;
      }
      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.units || ['units'] });
      toast.success('Unit deleted');
      return true;
    } catch (error: any) {
      handleSupabaseError(error, OperationType.DELETE, 'units');
      return false;
    }
  };

  return { 
    units: unitsQuery.data || [], 
    loading: unitsQuery.isPending, 
    addUnit, 
    updateUnit, 
    deleteUnit, 
    refresh: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.units || ['units'] }) 
  };
}
