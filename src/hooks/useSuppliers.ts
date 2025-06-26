import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SupplierMatch } from '../components/suppliers/SupplierMatchCard';

/**
 * Hook pour récupérer les fournisseurs et leurs profils de correspondance pour un brief donné.
 * Interroge la vue `supplier_matches`.
 */
export function useSuppliers(briefId: string) {
  const [suppliers, setSuppliers] = useState<SupplierMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    if (!briefId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('useSuppliers - Loading supplier matches for brief_id:', briefId);

      const { data, error: queryError } = await supabase
        .from('supplier_matches')
        .select('*')
        .eq('brief_id', briefId)
        .order('overall_match_score', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      console.log(`useSuppliers - ${data?.length || 0} supplier matches found.`);
      setSuppliers(data || []);

    } catch (err) {
      console.error('useSuppliers - Error:', err);
      setError(`An error occurred: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);

  useEffect(() => {
    loadSuppliers();
    // Note: Realtime subscription can be added here if needed in the future.
  }, [loadSuppliers]);

  return {
    suppliers,
    isLoading,
    error,
    refresh: loadSuppliers,
  };
}
