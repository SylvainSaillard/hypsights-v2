import { executeEdgeAction } from '../lib/edgeActionHelper';
import { supabase } from '../lib/supabaseClient';

// Nom de la fonction Edge
const EDGE_FUNCTION = 'fast-search-monitor';

/**
 * Interface pour les résultats de monitoring
 */
export interface MonitoringResult {
  solution_id: string;
  status: 'success' | 'failed' | 'no_results' | 'timeout';
  suppliers_found: number;
  refunded: boolean;
  reason?: string;
}

/**
 * Interface pour les logs de monitoring
 */
export interface MonitoringLog {
  id: string;
  solution_id: string;
  brief_id: string;
  user_id: string;
  check_type: 'auto_check' | 'manual_check' | 'refund';
  status: string;
  suppliers_found: number;
  refunded: boolean;
  details: any;
  created_at: string;
}

/**
 * Vérifier toutes les Fast Searches en attente
 * Cette fonction est appelée par un cron job ou manuellement
 */
export async function checkAllPendingSearches(delayMinutes: number = 10): Promise<MonitoringResult[]> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fast-search-monitor?action=check_all&delay=${delayMinutes}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error checking pending searches:', error);
    throw error;
  }
}

/**
 * Vérifier une Fast Search spécifique
 */
export async function checkSingleSearch(solutionId: string): Promise<MonitoringResult | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fast-search-monitor?action=check_one&solution_id=${solutionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error('Error checking single search:', error);
    throw error;
  }
}

/**
 * Récupérer les logs de monitoring pour un utilisateur
 */
export async function getUserMonitoringLogs(userId: string, limit: number = 20): Promise<MonitoringLog[]> {
  try {
    const { data, error } = await supabase
      .from('fast_search_monitoring_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching monitoring logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserMonitoringLogs:', error);
    throw error;
  }
}

/**
 * Récupérer les logs de monitoring pour un brief
 */
export async function getBriefMonitoringLogs(briefId: string): Promise<MonitoringLog[]> {
  try {
    const { data, error } = await supabase
      .from('fast_search_monitoring_logs')
      .select('*')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brief monitoring logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBriefMonitoringLogs:', error);
    throw error;
  }
}

/**
 * S'abonner aux changements de statut des Fast Searches
 */
export function subscribeToFastSearchStatus(
  briefId: string,
  onStatusChange: (payload: any) => void
) {
  const channel = supabase
    .channel(`fast_search_status:${briefId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'solutions',
        filter: `brief_id=eq.${briefId}`
      },
      (payload) => {
        // Vérifier si c'est un changement de statut Fast Search
        if (payload.new.fast_search_status !== payload.old?.fast_search_status) {
          onStatusChange(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Vérifier si une solution a été remboursée
 */
export async function isSolutionRefunded(solutionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('fast_search_refunded')
      .eq('id', solutionId)
      .single();

    if (error) {
      console.error('Error checking refund status:', error);
      return false;
    }

    return data?.fast_search_refunded || false;
  } catch (error) {
    console.error('Error in isSolutionRefunded:', error);
    return false;
  }
}
