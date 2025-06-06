import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore - Deno-specific import
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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

// Types
interface Solution {
  id: string;
  brief_id: string;
  title: string;
  description: string;
  ai_confidence: number;
  keywords: string[];
  status: 'proposed' | 'validated' | 'rejected';
  created_at: string;
  updated_at: string;
  metadata?: any;
  type?: string;
}

class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Création du client Supabase avec les variables d'environnement
function createSupabaseClient(): SupabaseClient {
  // @ts-ignore - Deno-specific API
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  // @ts-ignore - Deno-specific API
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Authentification de l'utilisateur à partir du token JWT
async function authenticateUser(req: Request): Promise<User> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      throw new Error('Invalid authentication token');
    }
    
    return user;
  } catch (error) {
    console.error('Authorization failed:', error);
    throw new HttpError('Unauthorized access', 401);
  }
}

// Tracking d'événements
async function trackEvent(eventData: any) {
  try {
    const supabase = createSupabaseClient();
    await supabase.from('raw_analytics_events').insert([eventData]);
  } catch (error) {
    console.error('Error tracking event:', error);
    // Ne pas bloquer le flux principal en cas d'erreur de tracking
  }
}

// Fonction pour récupérer les solutions d'un brief
async function getSolutions(briefId: string): Promise<Solution[]> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching solutions:', error);
      throw new HttpError(`Failed to fetch solutions: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in getSolutions:', error);
    throw error instanceof HttpError 
      ? error 
      : new HttpError(`Internal server error: ${(error as Error).message}`, 500);
  }
}

// Fonction pour valider une solution
async function validateSolution(solutionId: string, userId: string): Promise<Solution> {
  try {
    const supabase = createSupabaseClient();
    
    // Vérifier si la solution existe
    const { data: existingSolution, error: fetchError } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', solutionId)
      .single();
    
    if (fetchError || !existingSolution) {
      console.error('Error fetching solution:', fetchError);
      throw new HttpError(`Solution not found: ${solutionId}`);
    }
    
    // Mettre à jour le statut de la solution
    const { data: updatedSolution, error: updateError } = await supabase
      .from('solutions')
      .update({ 
        status: 'validated', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', solutionId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating solution:', updateError);
      throw new HttpError(`Failed to validate solution: ${updateError.message}`);
    }
    
    return updatedSolution;
  } catch (error) {
    console.error('Exception in validateSolution:', error);
    throw error instanceof HttpError 
      ? error 
      : new HttpError(`Internal server error: ${(error as Error).message}`, 500);
  }
}

// Handler principal pour traiter les requêtes
serve(async (req: Request) => {
  // Gestion des CORS pour toutes les requêtes
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    // 1. Authentification
    const user = await authenticateUser(req);
    
    // 2. Validation des entrées
    const { action, ...params } = await req.json();
    
    if (!action) {
      throw new HttpError('Missing required parameter: action');
    }
    
    // 3. Logique métier
    let result;
    
    switch (action) {
      case 'get_solutions':
        if (!params.brief_id) {
          throw new HttpError('Missing required parameter: brief_id');
        }
        result = await getSolutions(params.brief_id);
        break;
        
      case 'validate_solution':
        if (!params.solution_id) {
          throw new HttpError('Missing required parameter: solution_id');
        }
        result = await validateSolution(params.solution_id, user.id);
        break;
        
      default:
        throw new HttpError(`Unknown action: ${action}`);
    }
    
    // 4. Tracking
    await trackEvent({
      event_name: `solution_handler_${action}_success`,
      user_id: user.id,
      properties: { ...params }
    });
    
    // 5. Réponse avec CORS dynamiques
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error in solution-handler:', error);
    
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    await trackEvent({
      event_name: 'solution_handler_error',
      properties: { error: message, status }
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: message
    }), { 
      status,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
  }
});
