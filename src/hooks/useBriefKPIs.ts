import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface KPIData {
  solutions_count: number;
  suppliers_count: number;
  products_count: number;
  fast_searches_used: number;
}

interface AnimatedKPIData extends KPIData {
  // Animation states for each KPI
  solutions_count_prev: number;
  suppliers_count_prev: number;
  products_count_prev: number;
  fast_searches_used_prev: number;
  // Animation flags
  solutions_count_changed: boolean;
  suppliers_count_changed: boolean;
  products_count_changed: boolean;
  fast_searches_used_changed: boolean;
}

/**
 * Hook pour gérer les KPIs du brief avec mises à jour temps réel et animations
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
export function useBriefKPIs(briefId: string) {
  const [kpiData, setKpiData] = useState<AnimatedKPIData>({
    solutions_count: 0,
    suppliers_count: 0,
    products_count: 0,
    fast_searches_used: 0,
    solutions_count_prev: 0,
    suppliers_count_prev: 0,
    products_count_prev: 0,
    fast_searches_used_prev: 0,
    solutions_count_changed: false,
    suppliers_count_changed: false,
    products_count_changed: false,
    fast_searches_used_changed: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les KPIs
  const loadKPIs = useCallback(async () => {
    if (!briefId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch('/functions/v1/brief-header-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          action: 'get_brief_header_data',
          brief_id: briefId 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const newData = {
          solutions_count: result.data.solutions_count || 0,
          suppliers_count: result.data.suppliers_count || 0,
          products_count: result.data.products_count || 0,
          fast_searches_used: result.data.fast_searches_used || 0
        };

        // Détecter les changements pour les animations
        setKpiData(prev => ({
          ...newData,
          solutions_count_prev: prev.solutions_count,
          suppliers_count_prev: prev.suppliers_count,
          products_count_prev: prev.products_count,
          fast_searches_used_prev: prev.fast_searches_used,
          solutions_count_changed: newData.solutions_count !== prev.solutions_count,
          suppliers_count_changed: newData.suppliers_count !== prev.suppliers_count,
          products_count_changed: newData.products_count !== prev.products_count,
          fast_searches_used_changed: newData.fast_searches_used !== prev.fast_searches_used
        }));

        // Réinitialiser les flags d'animation après un délai
        setTimeout(() => {
          setKpiData(prev => ({
            ...prev,
            solutions_count_changed: false,
            suppliers_count_changed: false,
            products_count_changed: false,
            fast_searches_used_changed: false
          }));
        }, 2000); // Animation pendant 2 secondes
        
      } else {
        console.error('Error fetching KPIs:', result.error || 'No data received');
        setError(result.error || 'Failed to load KPIs');
      }
    } catch (error) {
      console.error('Exception while fetching KPIs:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);

  // Effet pour configurer l'abonnement real-time
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useBriefKPIs - Setting up realtime subscription for briefId:', briefId);
    
    // Abonnement aux changements dans les tables qui affectent les KPIs
    const kpiChannel = supabase
      .channel(`brief_kpis_${briefId}`)
      // Solutions
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'solutions',
        filter: `brief_id=eq.${briefId}`
      }, () => {
        console.log('useBriefKPIs - Solutions change detected, refreshing KPIs');
        loadKPIs();
      })
      // Supplier matches (pour suppliers_count et products_count)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'supplier_matches',
        filter: `brief_id=eq.${briefId}`
      }, () => {
        console.log('useBriefKPIs - Supplier matches change detected, refreshing KPIs');
        loadKPIs();
      })
      .subscribe((status: string) => {
        console.log('useBriefKPIs - Subscription status:', status);
      });
    
    // Charger les KPIs au montage
    loadKPIs();
    
    // Nettoyage de l'abonnement
    return () => {
      console.log('useBriefKPIs - Cleaning up subscription');
      supabase.removeChannel(kpiChannel);
    };
  }, [briefId]);

  return {
    kpiData,
    isLoading,
    error,
    refresh: loadKPIs
  };
}
