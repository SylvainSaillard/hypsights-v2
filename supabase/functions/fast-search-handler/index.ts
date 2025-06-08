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
    // Log pour débogage
    console.log('Requête reçue:', req.method, req.url);
    console.log('Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    console.log('Supabase URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Authentification
    console.log('Tentative d\'authentification...');
    const { user, supabase: authenticatedSupabase } = await authenticateUser(req);
    console.log('Authentification réussie pour l\'utilisateur:', user.id);
    clientSupabase = authenticatedSupabase;
    
    // 2. Validation des entrées
    console.log('Parsing du corps de la requête...');
    const body = await req.text();
    console.log('Corps de la requête:', body);
    
    let jsonData;
    try {
      jsonData = JSON.parse(body);
    } catch (e) {
      console.error('Erreur de parsing JSON:', e);
      throw new HttpError('invalid_json_format', 400);
    }
    
    const { action, ...params } = jsonData;
    console.log('Action demandée:', action);
    console.log('Paramètres reçus:', JSON.stringify(params));
    
    const validatedParams = validateInput(action, params);
    console.log('Paramètres validés:', JSON.stringify(validatedParams));
    
    // 3. Logique métier
    let result;
    
    switch (action) {
      case 'start_fast_search':
        result = await startFastSearch(params, user, supabase);
        break;
      case 'get_fast_search_results':
        result = await getFastSearchResults(validatedParams, user, supabase);
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
    // Log détaillé de l'erreur
    console.error('Erreur dans la fonction Edge:', error);
    console.error('Stack trace:', error.stack);
    
    // Tracking des erreurs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    await trackEvent(supabase, {
      event_name: 'fast_search_error',
      properties: { error: error.message, stack: error.stack }
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
  console.log(`Validation des paramètres pour l'action: ${action}`);
  
  switch (action) {
    case 'start_fast_search':
      console.log('Validation du brief_id:', params.brief_id);
      if (!params.brief_id) {
        console.error('brief_id manquant ou invalide');
        throw new HttpError('invalid_brief');
      }
      // Nous n'avons plus besoin de valider validated_solutions car nous allons chercher
      // les solutions validées directement dans la base de données
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
async function startFastSearch(params: any, user: User, supabase: SupabaseClient): Promise<any> {
  const { brief_id } = params;
  
  // Vérifier si l'utilisateur a dépassé son quota de recherches rapides
  const { data: userQuota, error: quotaError } = await supabase
    .from('users')
    .select('fast_search_quota')
    .eq('id', user.id)
    .single();
  
  if (quotaError || !userQuota || userQuota.fast_search_quota <= 0) {
    throw new HttpError('quota_exceeded');
  }
  
  // Récupérer les solutions validées pour ce brief
  const { data: validatedSolutions, error: solutionsError } = await supabase
    .from('solutions')
    .select('id, title')
    .eq('brief_id', brief_id)
    .eq('status', 'public.solution_status.validated');
    
  if (solutionsError || !validatedSolutions || validatedSolutions.length === 0) {
    console.error('Aucune solution validée trouvée:', solutionsError);
    throw new HttpError('invalid_solution');
  }
  
  console.log('Solutions validées trouvées:', validatedSolutions.length);
  
  // Vérifier si une recherche est déjà en cours pour ce brief
  const { data: existingSearch, error: searchError } = await supabase
    .from('searches')
    .select('id, status')
    .eq('brief_id', brief_id)
    .eq('type', 'fast')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (existingSearch && existingSearch.length > 0 && existingSearch[0].status === 'in_progress') {
    throw new HttpError('search_in_progress');
  }
  
  // Créer un nouvel enregistrement de recherche
  const { data: search, error: createError } = await supabase
    .from('searches')
    .insert({
      brief_id,
      user_id: user.id,
      type: 'fast',
      status: 'in_progress',
      validated_solutions: validatedSolutions.map(s => ({ id: s.id, title: s.title }))
    })
    .select()
    .single();
    
  if (createError || !search) {
    throw new HttpError('Failed to create search record');
  }
  
  // Appeler le webhook n8n de manière asynchrone
  try {
    fetch('https://n8n.hypsights.io/webhook/searchsupplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search_id: search.id,
        brief_id: brief_id,
        user_id: user.id
      })
    }).catch(error => {
      console.error('Erreur lors de l\'appel au webhook n8n:', error);
    });
  } catch (error) {
    console.error('Erreur lors de l\'appel au webhook n8n:', error);
    // Ne pas bloquer le processus si le webhook échoue
  }
  
  return {
    search_id: search.id,
    status: 'in_progress',
    message: 'Recherche rapide lancée avec succès'
  };
}

// Action pour récupérer les résultats d'une recherche rapide
async function getFastSearchResults(params: any, user: User, supabase: SupabaseClient): Promise<any> {
  const { brief_id, search_id } = params;

  // Récupérer les données de la recherche
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .select('id, status, created_at, completed_at')
    .eq('id', search_id)
    .eq('brief_id', brief_id)
    .eq('user_id', user.id)
    .single();

  if (searchError || !search) {
    throw new HttpError('Search not found');
  }

  // Récupérer les fournisseurs associés à cette recherche
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('id, name, description, website_url, logo_url, contact_email, contact_phone, location')
    .eq('search_id', search_id);

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
    search: search || { status: 'not_found' },
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
