// Edge Function: Fast Search Callback
// Description: Appelé par N8n à la fin du traitement pour confirmer le succès ou l'échec
// Usage: POST avec { solution_id, status, suppliers_count?, error_message? }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Configuration
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://www.hypsights.com',
  'https://n8n-hypsights.proxiwave.app',
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
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '*'
  };
}

// Types
interface CallbackPayload {
  solution_id: string;
  status: 'finished' | 'error';
  suppliers_count?: number;
  error_message?: string;
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
    console.log('Fast Search Callback - Requête reçue');

    // Initialiser Supabase Admin client (pas d'auth requise car appelé par N8n)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parser le body
    const body = await req.text();
    console.log('Body reçu:', body);

    let payload: CallbackPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error('Invalid JSON payload');
    }

    // Validation
    if (!payload.solution_id) {
      throw new Error('solution_id is required');
    }
    if (!payload.status || !['finished', 'error'].includes(payload.status)) {
      throw new Error('status must be "finished" or "error"');
    }

    console.log(`Callback pour solution ${payload.solution_id}: status=${payload.status}`);

    // Compter les vrais suppliers trouvés dans la base
    const { count: actualSupplierCount, error: countError } = await supabase
      .from('supplier_match_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('solution_id', payload.solution_id);

    if (countError) {
      console.error('Erreur lors du comptage des suppliers:', countError);
    }

    const realSupplierCount = actualSupplierCount || 0;
    console.log(`Suppliers réellement trouvés: ${realSupplierCount}`);

    // Déterminer si on doit rembourser
    // Rembourser si: erreur N8n OU (finished mais 0 suppliers)
    const shouldRefund = payload.status === 'error' || (payload.status === 'finished' && realSupplierCount === 0);
    const finalStatus = shouldRefund ? 'failed' : 'success';

    // Mettre à jour la solution
    // IMPORTANT: Ne pas modifier le champ 'status' de la solution (validated/proposed/etc.)
    // Seul fast_search_status doit être mis à jour pour le monitoring
    const updateData: Record<string, unknown> = {
      fast_search_status: finalStatus,
      fast_search_checked_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('solutions')
      .update(updateData)
      .eq('id', payload.solution_id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      throw updateError;
    }

    console.log(`✓ Solution mise à jour: status=${finalStatus}, suppliers=${realSupplierCount}`);

    // Rembourser si nécessaire
    if (shouldRefund) {
      const refundReason = payload.status === 'error' 
        ? (payload.error_message || 'N8n workflow failed')
        : 'No suppliers found after Fast Search completed';
      
      console.log(`Remboursement nécessaire - Raison: ${refundReason}`);
      
      const { error: refundError } = await supabase
        .rpc('refund_fast_search', {
          p_solution_id: payload.solution_id,
          p_reason: refundReason
        });

      if (refundError) {
        console.error('Erreur lors du remboursement:', refundError);
      } else {
        console.log('✓ Quota remboursé');
      }
    }

    // Logger l'événement
    const { data: solutionData } = await supabase
      .from('solutions')
      .select('brief_id')
      .eq('id', payload.solution_id)
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
            solution_id: payload.solution_id,
            brief_id: solutionData.brief_id,
            user_id: briefData.user_id,
            check_type: 'n8n_callback',
            status: finalStatus,
            suppliers_found: realSupplierCount,
            refunded: shouldRefund,
            details: {
              n8n_status: payload.status,
              n8n_suppliers_count: payload.suppliers_count,
              actual_suppliers_count: realSupplierCount,
              error_message: payload.error_message,
              callback_received_at: new Date().toISOString()
            }
          });
      }
    }

    // Tracking analytics
    await supabase
      .from('search_events')
      .insert({
        user_id: null,
        type: 'callback',
        source: 'n8n_webhook',
        metadata: {
          solution_id: payload.solution_id,
          status: payload.status,
          suppliers_count: payload.suppliers_count
        },
        launched_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Solution ${payload.solution_id} updated to ${payload.status}`,
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
    console.error('Erreur dans Fast Search Callback:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
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
