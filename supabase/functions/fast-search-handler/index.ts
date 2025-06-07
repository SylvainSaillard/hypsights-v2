import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Fonction principale
serve(async (req: Request) => {
  // CORS headers pour toutes les requêtes
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Authentification
    const user = await authenticateUser(req, supabase);
    
    // 2. Validation des entrées
    const { action, ...params } = await req.json();
    validateInput(params, action);
    
    // 3. Logique métier
    let result;
    switch (action) {
      case 'start_fast_search':
        result = await startFastSearch(params, user, supabase, supabaseAdmin);
        break;
      case 'get_fast_search_results':
        result = await getFastSearchResults(params, user, supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // 4. Tracking analytique
    await trackEvent({
      event_name: `fast_search_${action}_success`,
      user_id: user.id,
      properties: { ...params }
    }, supabase);
    
    // 5. Réponse avec CORS
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in fast-search-handler:', error);
    
    // Tracking d'erreur
    await trackEvent({
      event_name: `fast_search_error`,
      properties: { error: error.message }
    }, supabase);
    
    // Réponse avec erreur
    return new Response(
      JSON.stringify({
        success: false,
        error: getUserFriendlyError(error.message)
      }),
      {
        status: error.status || 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Helper pour l'authentification
async function authenticateUser(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }
  
  return user;
}

// Validation des entrées
function validateInput(params: any, action: string) {
  switch (action) {
    case 'start_fast_search':
      if (!params.brief_id) {
        throw new Error('Missing required field: brief_id');
      }
      if (!params.validated_solutions || !Array.isArray(params.validated_solutions) || params.validated_solutions.length === 0) {
        throw new Error('invalid_solution');
      }
      break;
    case 'get_fast_search_results':
      if (!params.brief_id) {
        throw new Error('Missing required field: brief_id');
      }
      break;
    default:
      throw new Error(`Invalid action: ${action}`);
  }
  
  return params;
}

// Action pour démarrer une recherche rapide
async function startFastSearch(params: any, user: any, supabase: any, supabaseAdmin: any) {
  const { brief_id, validated_solutions } = params;
  
  // 1. Vérifier le quota de Fast Search de l'utilisateur
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('fast_search_quota, fast_search_used')
    .eq('id', user.id)
    .single();
    
  if (userError || !userData) {
    throw new Error('Failed to check user quota');
  }
  
  if (userData.fast_search_used >= userData.fast_search_quota) {
    throw new Error('quota_exceeded');
  }
  
  // 2. Incrémenter le compteur de Fast Search utilisés
  await supabase
    .from('users')
    .update({ fast_search_used: userData.fast_search_used + 1 })
    .eq('id', user.id);
  
  // 3. Créer un enregistrement de recherche
  const { data: searchData, error: searchError } = await supabase
    .from('searches')
    .insert({
      brief_id,
      user_id: user.id,
      status: 'pending',
      search_type: 'fast'
    })
    .select()
    .single();
    
  if (searchError || !searchData) {
    throw new Error('Failed to create search record');
  }
  
  // 4. Appeler le webhook n8n de façon asynchrone
  fetch('https://n8n.proxiwave.com/webhook-test/searchsupplier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brief_id,
      search_id: searchData.id,
      validated_solutions,
      user_id: user.id
    })
  }).catch(err => console.error('Webhook call failed:', err));
  
  // 5. Retourner immédiatement avec l'ID de recherche
  return {
    search_id: searchData.id,
    status: 'pending',
    quota: {
      used: userData.fast_search_used + 1,
      total: userData.fast_search_quota
    }
  };
}

// Action pour récupérer les résultats de recherche rapide
async function getFastSearchResults(params: any, user: any, supabase: any) {
  const { brief_id, search_id } = params;
  
  // Récupérer les fournisseurs liés au brief
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('id, name, description, website, created_at')
    .eq('brief_id', brief_id);
    
  if (suppliersError) {
    throw new Error('Failed to fetch suppliers');
  }
  
  // Pour chaque fournisseur, récupérer ses produits
  const suppliersWithProducts = await Promise.all(
    (suppliers || []).map(async (supplier) => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, created_at')
        .eq('supplier_id', supplier.id);
        
      if (productsError) {
        console.error('Error fetching products for supplier:', supplier.id, productsError);
        return { ...supplier, products: [] };
      }
      
      return { ...supplier, products: products || [] };
    })
  );
  
  // Récupérer le statut de la recherche si un search_id est fourni
  let searchStatus = null;
  if (search_id) {
    const { data: searchData, error: searchError } = await supabase
      .from('searches')
      .select('status')
      .eq('id', search_id)
      .single();
      
    if (!searchError && searchData) {
      searchStatus = searchData.status;
    }
  }
  
  return {
    status: searchStatus,
    suppliers: suppliersWithProducts || []
  };
}

// Fonction pour le tracking analytique
async function trackEvent(eventData: any, supabase: any) {
  try {
    if (!supabase) return;
    
    await supabase
      .from('search_events')
      .insert({
        user_id: eventData.user_id,
        type: eventData.event_name.split('_')[1] || 'other',
        source: 'edge_function',
        metadata: eventData.properties,
        launched_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Ne pas propager l'erreur - l'échec du tracking ne doit pas casser la fonction principale
  }
}

// Messages d'erreur conviviaux
const ERROR_MESSAGES = {
  'quota_exceeded': 'You have reached your search limit. Please upgrade to continue.',
  'invalid_solution': 'Please validate a solution before launching a search.',
  'network_error': 'Connection issue. Please try again.',
  'rate_limit': 'Too many requests. Please wait a moment.',
  'default': 'Something went wrong. Please try again or contact support.'
};

function getUserFriendlyError(error: string): string {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.includes(key)) {
      return message;
    }
  }
  return ERROR_MESSAGES.default;
}
