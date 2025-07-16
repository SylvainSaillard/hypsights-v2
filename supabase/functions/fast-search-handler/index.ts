// Types pour l'environnement Deno Edge de Supabase
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Importations pour Deno et Supabase
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration CORS
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://hypsights-v2.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    return { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin };
  }
  return CORS_HEADERS;
}

// Classe d'erreur HTTP personnalisée
class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Point d'entrée principal de la fonction Edge
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  let supabase: SupabaseClient | null = null;
  let user: User | null = null;

  try {
    // Authentification et initialisation
    const authResult = await authenticateUser(req);
    supabase = authResult.supabase;
    user = authResult.user;

    if (req.method !== 'POST') throw new HttpError('Method not allowed', 405);
    const { action, brief_id, solution_id } = await req.json();
    if (action !== 'start_fast_search') throw new HttpError('Invalid action', 400);
    if (!brief_id || !solution_id) throw new HttpError('Missing brief_id or solution_id', 400);

    // Logique métier
    const result = await startFastSearch(supabase, brief_id, solution_id, user);

    // Réponse de succès
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'Internal server error';

    console.error(`[${statusCode}] ${errorMessage}`, { stack: error.stack });
    if (supabase && user) {
      await trackEvent(supabase, {
        event_name: 'fast_search_error',
        properties: { user_id: user.id, error: errorMessage }
      });
    }

    // Réponse d'erreur
    return new Response(JSON.stringify({ success: false, error: getUserFriendlyError(errorMessage) }), {
      status: statusCode,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});

// Fonction d'authentification
async function authenticateUser(req: Request): Promise<{ user: User; supabase: SupabaseClient }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new HttpError('Missing or invalid token', 401);
  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new HttpError('Authentication failed', 401);

  return { user, supabase };
}

// Fonction de recherche rapide
async function startFastSearch(supabase: SupabaseClient, briefId: string, solutionId: string, user: User) {
  // 1. Gérer le quota
  const { data: quotaData, error: quotaError } = await supabase.rpc('increment_fast_searches_used', { p_user_id: user.id });
  if (quotaError) {
    console.error('Database error during quota check:', quotaError);
    throw new HttpError('database_error', 500);
  }

  const quotaResult = quotaData[0];
  if (!quotaResult.success) {
    return { 
      status: 429, // Too Many Requests
      body: { success: false, error: 'quota_exceeded', quota: { used: quotaResult.used, total: quotaResult.total } }
    };
  }

  // 2. Mettre à jour la solution
  const { error: updateError } = await supabase
    .from('solutions')
    .update({ status: 'in_progress', fast_search_launched_at: new Date().toISOString() })
    .eq('id', solutionId);
  if (updateError) {
    console.error('Failed to update solution status:', updateError);
    throw new HttpError('database_error', 500);
  }

  // 3. Déclencher le webhook N8N
  const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_FAST_SEARCH');
  if (!n8nWebhookUrl) throw new HttpError('webhook_not_configured', 500);

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief_id: briefId, solution_id: solutionId, user_id: user.id }),
  });
  if (!response.ok) {
      const errorBody = await response.text();
      console.error(`N8N webhook call failed with status ${response.status}:`, errorBody);
      throw new HttpError('webhook_error', 502);
  }

  // 4. Tracking et réponse
  await trackEvent(supabase, {
    event_name: 'fast_search_started',
    properties: { user_id: user.id, brief_id: briefId, solution_id: solutionId }
  });
  
  return { 
    status: 200,
    body: { success: true, message: 'Fast search started', quota: { used: quotaResult.used, total: quotaResult.total } }
  };
}

// Fonction de tracking
async function trackEvent(supabase: SupabaseClient, event: { event_name: string, properties: Record<string, any> }): Promise<void> {
  try {
    await supabase.from('raw_analytics_events').insert({ 
      event_name: event.event_name, 
      properties: event.properties 
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}

// Fonction pour les messages d'erreur utilisateur
function getUserFriendlyError(errorKey: string): string {
  const messages: Record<string, string> = {
    'quota_exceeded': 'Vous avez atteint votre quota de recherches rapides.',
    'database_error': 'Une erreur de base de données est survenue.',
    'webhook_error': 'Une erreur est survenue lors du lancement de la recherche.',
    'webhook_not_configured': 'Le service de recherche est actuellement indisponible.',
    'default': 'Une erreur est survenue. Veuillez réessayer.'
  };
  return messages[errorKey] || messages['default'];
}
