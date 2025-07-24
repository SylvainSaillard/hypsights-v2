import { useState, useEffect, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { SupplierMatch } from '../components/suppliers/SupplierMatchCard';

// Structure pour organiser les fournisseurs par solution
export interface SolutionGroup {
  solutionId: string;
  solutionName: string;
  solutionNumber?: number;
  suppliers: SupplierMatch[];
}

/**
 * Hook pour récupérer les fournisseurs et leurs profils de correspondance pour un brief donné.
 * Interroge la vue `supplier_matches` et écoute les changements en temps réel sur la table `supplier_match_profiles`.
 */
export function useSuppliers(briefId: string) {
  const [suppliers, setSuppliers] = useState<SupplierMatch[]>([]);
  const [solutionGroups, setSolutionGroups] = useState<SolutionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fonction pour grouper les fournisseurs par solution
  const groupSuppliersBySolution = (suppliersList: SupplierMatch[]): SolutionGroup[] => {
    const groups = new Map<string, SolutionGroup>();
    
    suppliersList.forEach(supplier => {
      const solutionId = supplier.solution_id || 'unknown';
      const solutionName = supplier.solution_name || 'Unknown Solution';
      const solutionNumber = supplier.solution_number;
      
      if (!groups.has(solutionId)) {
        groups.set(solutionId, {
          solutionId,
          solutionName,
          solutionNumber,
          suppliers: []
        });
      }
      
      groups.get(solutionId)!.suppliers.push(supplier);
    });
    
    // Trier les groupes par numéro de solution (croissant)
    return Array.from(groups.values()).sort((a, b) => {
      const numA = a.solutionNumber || 999;
      const numB = b.solutionNumber || 999;
      return numA - numB;
    });
  };

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

      const suppliersList = data || [];
      setSuppliers(suppliersList);
      setSolutionGroups(groupSuppliersBySolution(suppliersList));
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
    solutionGroups,
    isLoading,
    error,
    refresh: fetchSuppliers,
  };
}
