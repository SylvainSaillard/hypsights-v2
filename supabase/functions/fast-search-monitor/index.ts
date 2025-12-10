// Edge Function: Fast Search Monitor
// Description: Vérifie les Fast Searches après 10 minutes et rembourse si échec
// Usage: Appelé automatiquement par un cron job ou manuellement

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Configuration
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://www.hypsights.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  };
}

// Types
interface FastSearchToCheck {
  solution_id: string;
  brief_id: string;
  user_id: string;
  launched_at: string;
  minutes_elapsed: number;
}

interface MonitoringResult {
  solution_id: string;
  status: 'success' | 'failed' | 'no_results' | 'timeout';
  suppliers_found: number;
  refunded: boolean;
  reason?: string;
}

// Déclaration Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Fonction principale
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    console.log('Fast Search Monitor - Démarrage');

    // Initialiser Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer les paramètres
    const url = new URL(req.url);
    const checkDelayMinutes = parseInt(url.searchParams.get('delay') || '90');
    const action = url.searchParams.get('action') || 'check_all';

    console.log(`Action: ${action}, Délai: ${checkDelayMinutes} minutes`);

    let results: MonitoringResult[] = [];

    if (action === 'check_all') {
      // Vérifier toutes les Fast Searches en attente
      results = await checkAllPendingSearches(supabaseAdmin, checkDelayMinutes);
    } else if (action === 'check_one') {
      // Vérifier une Fast Search spécifique
      const solutionId = url.searchParams.get('solution_id');
      if (!solutionId) {
        throw new Error('solution_id required for check_one action');
      }
      const result = await checkSingleSearch(supabaseAdmin, solutionId);
      results = result ? [result] : [];
    }

    console.log(`Monitoring terminé: ${results.length} Fast Searches vérifiées`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        results: results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Erreur dans Fast Search Monitor:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Vérifier toutes les Fast Searches en attente
async function checkAllPendingSearches(
  supabase: SupabaseClient,
  delayMinutes: number
): Promise<MonitoringResult[]> {
  console.log(`Recherche des Fast Searches à vérifier (délai: ${delayMinutes} min)`);

  // Utiliser la fonction SQL pour obtenir les Fast Searches à vérifier
  const { data: searchesToCheck, error } = await supabase
    .rpc('get_fast_searches_to_check', { check_delay_minutes: delayMinutes });

  if (error) {
    console.error('Erreur lors de la récupération des Fast Searches:', error);
    throw error;
  }

  console.log(`${searchesToCheck?.length || 0} Fast Searches à vérifier`);

  if (!searchesToCheck || searchesToCheck.length === 0) {
    return [];
  }

  // Vérifier chaque Fast Search
  const results: MonitoringResult[] = [];
  for (const search of searchesToCheck as FastSearchToCheck[]) {
    try {
      const result = await checkSingleSearch(supabase, search.solution_id);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de ${search.solution_id}:`, error);
    }
  }

  return results;
}

// Vérifier une Fast Search spécifique
async function checkSingleSearch(
  supabase: SupabaseClient,
  solutionId: string
): Promise<MonitoringResult | null> {
  console.log(`Vérification de la Fast Search pour solution: ${solutionId}`);

  try {
    // 1. Compter les fournisseurs trouvés
    const { data: supplierCount, error: countError } = await supabase
      .rpc('count_suppliers_for_solution', { p_solution_id: solutionId });

    if (countError) {
      console.error('Erreur lors du comptage des fournisseurs:', countError);
      throw countError;
    }

    const suppliersFound = supplierCount || 0;
    console.log(`Fournisseurs trouvés: ${suppliersFound}`);

    // 2. Déterminer le statut
    let status: 'success' | 'failed' | 'no_results' | 'timeout';
    let refunded = false;
    let reason: string | undefined;

    if (suppliersFound > 0) {
      // Succès: au moins un fournisseur trouvé
      status = 'success';
      console.log('✓ Fast Search réussie');
    } else {
      // Échec: aucun fournisseur trouvé après 10 minutes
      status = 'no_results';
      reason = 'No suppliers found after 10 minutes - workflow may have failed or no results available';
      refunded = true;
      console.log('✗ Fast Search échouée - remboursement nécessaire');
    }

    // 3. Mettre à jour le statut de la solution
    const { error: updateError } = await supabase
      .from('solutions')
      .update({
        fast_search_status: status,
        fast_search_checked_at: new Date().toISOString()
      })
      .eq('id', solutionId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut:', updateError);
    }

    // 4. Rembourser si nécessaire
    if (refunded) {
      console.log('Déclenchement du remboursement...');
      const { data: refundResult, error: refundError } = await supabase
        .rpc('refund_fast_search', {
          p_solution_id: solutionId,
          p_reason: reason
        });

      if (refundError) {
        console.error('Erreur lors du remboursement:', refundError);
        refunded = false;
      } else {
        console.log('✓ Remboursement effectué');
      }
    }

    // 5. Logger l'événement
    const { data: solutionData } = await supabase
      .from('solutions')
      .select('brief_id')
      .eq('id', solutionId)
      .single();

    if (solutionData) {
      const { data: briefData } = await supabase
        .from('briefs')
        .select('user_id')
        .eq('id', solutionData.brief_id)
        .single();

      if (briefData) {
        await supabase
          .from('fast_search_monitoring_logs')
          .insert({
            solution_id: solutionId,
            brief_id: solutionData.brief_id,
            user_id: briefData.user_id,
            check_type: 'auto_check',
            status: status,
            suppliers_found: suppliersFound,
            refunded: refunded,
            details: {
              reason: reason,
              checked_at: new Date().toISOString()
            }
          });
      }
    }

    return {
      solution_id: solutionId,
      status,
      suppliers_found: suppliersFound,
      refunded,
      reason
    };

  } catch (error) {
    console.error(`Erreur lors de la vérification de ${solutionId}:`, error);
    return null;
  }
}
