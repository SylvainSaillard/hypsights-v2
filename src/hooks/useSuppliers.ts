import { useState, useEffect, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { SupplierMatch } from '../components/suppliers/SupplierMatchCard';

/**
 * Hook pour récupérer les fournisseurs et leurs profils de correspondance pour un brief donné.
 * Interroge la vue `supplier_matches` et écoute les changements en temps réel sur la table `supplier_match_profiles`.
 */
export function useSuppliers(briefId: string) {
  const [suppliers, setSuppliers] = useState<SupplierMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSuppliers = useCallback(async () => {
    if (!briefId) return;

    // Ne pas afficher le loader pour les rafraîchissements pour éviter le clignotement
    setError(null);

    try {
      const { data, error } = await supabase
        .from('supplier_matches')
        .select('*')
        .eq('brief_id', briefId)
        .order('overall_match_score', { ascending: false });

      if (error) throw error;

      setSuppliers(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching suppliers:', err);
    } finally {
      setIsLoading(false); // S'assurer que le chargement est terminé après le premier fetch
    }
  }, [briefId]);

  useEffect(() => {
    setIsLoading(true);
    fetchSuppliers();

    const channel = supabase
      .channel(`supplier-matches-for-brief-${briefId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_match_profiles',
          filter: `brief_id=eq.${briefId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          console.log('Change detected in supplier_match_profiles, refreshing...', payload);
          fetchSuppliers();
        }
      )
      .subscribe();

    // Nettoyer l'abonnement au démontage du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, [briefId, fetchSuppliers]);

  return {
    suppliers,
    isLoading,
    error,
    refresh: fetchSuppliers,
  };
}
