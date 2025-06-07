// Déclarations de types pour Deno
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

// Importations avec les chemins complets pour Deno
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Template v1.0 (2025-06-04) - Standardized implementation
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://hypsights-v2.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': [
    'authorization', 'x-client-info', 'apikey', 'content-type',
    'x-user-locale', 'x-request-id', 'accept', 'accept-encoding',
    'accept-language', 'cache-control', 'pragma'
  ].join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  return (origin && ALLOWED_ORIGINS.includes(origin)) 
    ? origin 
    : 'https://hypsights-v2.netlify.app';
}

function getCorsHeaders(req: Request): Record<string, string> {
  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': getAllowedOrigin(req)
  };
}

// Classe d'erreur HTTP pour une gestion cohérente des erreurs
class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Déclaration pour Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Fonction principale
serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  let clientSupabase: SupabaseClient | null = null;
  
  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Authentification
    const { user, supabase: authenticatedSupabase } = await authenticateUser(req);
    clientSupabase = authenticatedSupabase;
    
    // 2. Validation des entrées
    const { action, ...params } = await req.json();
    const validatedParams = validateInput(action, params);
    
    // 3. Logique métier
    let result;
    
    switch (action) {
      case 'start_fast_search':
        result = await startFastSearch(supabase, user.id, validatedParams.brief_id, validatedParams.validated_solutions);
        break;
      case 'get_fast_search_results':
        result = await getFastSearchResults(supabase, validatedParams.brief_id);
        break;
      default:
        throw new HttpError(`Action non supportée: ${action}`, 400);
    }
    
    // 4. Tracking analytique
    await trackEvent(clientSupabase, {
      event_name: `fast_search_${action}_success`,
      user_id: user.id,
      properties: validatedParams
    });
    
    // 5. Réponse avec CORS
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    // Tracking des erreurs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    await trackEvent(supabase, {
      event_name: 'fast_search_error',
      properties: { error: error.message }
    });
    
    // Réponse avec erreur
    return new Response(
      JSON.stringify({
        success: false,
        error: getUserFriendlyError(error.message)
      }),
      {
        status: error.status || 500,
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Helper pour l'authentification
async function authenticateUser(req: Request): Promise<{ user: User; supabase: SupabaseClient }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError('auth_required', 401);
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new HttpError('auth_invalid', 401);
  }
  
  return { user, supabase };
}

// Validation des entrées
function validateInput(action: string, params: any): any {
  switch (action) {
    case 'start_fast_search':
      if (!params.brief_id) {
        throw new HttpError('invalid_brief');
      }
      if (!params.validated_solutions || !Array.isArray(params.validated_solutions) || params.validated_solutions.length === 0) {
        throw new HttpError('invalid_solution');
      }
      break;
    case 'get_fast_search_results':
      if (!params.brief_id) {
        throw new HttpError('invalid_brief');
      }
      break;
    default:
      throw new HttpError(`Invalid action: ${action}`);
  }
  
  return params;
}

// Action pour démarrer une recherche rapide
async function startFastSearch(
  supabase: SupabaseClient, 
  userId: string, 
  brief_id: string, 
  validated_solutions: any[]
): Promise<{
  search_id: string;
  status: string;
  message: string;
}> {
  // 1. Vérifier le quota de l'utilisateur
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('fast_search_used, fast_search_quota')
    .eq('id', userId)
    .single();
    
  if (userError || !userData) {
    throw new HttpError('Failed to check user quota');
  }
  
  if (userData.fast_search_used >= userData.fast_search_quota) {
    throw new HttpError('quota_exceeded');
  }
  
  // 2. Incrémenter le compteur de Fast Search utilisés
  await supabase
    .from('users')
    .update({ fast_search_used: userData.fast_search_used + 1 })
    .eq('id', userId);
  
  // 3. Créer un enregistrement de recherche
  const { data: searchData, error: searchError } = await supabase
    .from('searches')
    .insert({
      brief_id,
      user_id: userId,
      status: 'pending',
      type: 'fast',
      validated_solutions
    })
    .select()
    .single();
    
  if (searchError || !searchData) {
    throw new HttpError('Failed to create search record');
  }
  
  // 4. Appeler le webhook n8n de façon asynchrone
  fetch('https://n8n.proxiwave.com/webhook-test/searchsupplier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brief_id,
      search_id: searchData.id,
      validated_solutions
    })
  }).catch(err => console.error('Webhook call failed:', err));
  
  return {
    search_id: searchData.id,
    status: 'pending',
    message: 'Fast Search started successfully'
  };
}

// Action pour récupérer les résultats de recherche rapide
async function getFastSearchResults(
  supabase: SupabaseClient, 
  brief_id: string
): Promise<{
  search: any;
  suppliers: any[];
  count: number;
}> {
  // 1. Récupérer la recherche associée au brief
  const { data: searchData } = await supabase
    .from('searches')
    .select('id, status, created_at')
    .eq('brief_id', brief_id)
    .eq('type', 'fast')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  // 2. Récupérer les fournisseurs associés au brief
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('id, name, website, description, logo_url, country, city')
    .eq('brief_id', brief_id);
    
  if (suppliersError) {
    throw new HttpError('Failed to fetch suppliers');
  }
  
  // Pour chaque fournisseur, récupérer ses produits
  const suppliersWithProducts: Array<any> = [];
  
  if (suppliers && Array.isArray(suppliers)) {
    for (const supplier of suppliers) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, description, image_url, price_range, supplier_id')
        .eq('supplier_id', supplier.id);
      
      suppliersWithProducts.push({
        ...supplier,
        products: products || []
      });
    }
  }
  
  return {
    search: searchData || { status: 'not_found' },
    suppliers: suppliersWithProducts,
    count: suppliersWithProducts.length
  };
}

// Fonction pour le tracking analytique
async function trackEvent(supabase: SupabaseClient | null, event: {
  event_name: string;
  user_id?: string;
  properties: Record<string, any>;
}): Promise<void> {
  if (!supabase) return;
  
  try {
    await supabase
      .from('search_events')
      .insert({
        user_id: event.user_id,
        type: event.event_name.split('_')[1] || 'other',
        source: 'edge_function',
        metadata: event.properties,
        launched_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Ne pas propager l'erreur - l'analytics ne doit pas bloquer la fonction principale
  }
}

// Messages d'erreur conviviaux pour l'utilisateur
const ERROR_MESSAGES: Record<string, string> = {
  'auth_required': 'Authentification requise',
  'auth_invalid': 'Session invalide ou expirée',
  'quota_exceeded': 'Vous avez atteint votre limite de recherches rapides',
  'invalid_solution': 'Veuillez valider une solution avant de lancer une recherche',
  'invalid_brief': 'Brief introuvable ou inaccessible',
  'search_in_progress': 'Une recherche est déjà en cours pour ce brief',
  'default': 'Une erreur est survenue. Veuillez réessayer.'  
};

function getUserFriendlyError(errorMessage: string): string {
  // Si l'erreur est un objet HttpError, utiliser son message
  if (typeof errorMessage === 'object' && errorMessage !== null) {
    errorMessage = String(errorMessage);
  }
  
  // Chercher une correspondance partielle dans les clés d'erreur
  for (const key of Object.keys(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return ERROR_MESSAGES[key];
    }
  }
  
  return ERROR_MESSAGES.default;
}
