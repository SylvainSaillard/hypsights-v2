import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531' // Additional local development port
];

// Define the base CORS headers structure
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400' // 24 heures pour optimiser
};

// Function to get allowed origin based on the request
function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  
  // Return the origin if it's in the allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Default to the production URL
  return 'https://hypsights-v2.netlify.app';
}

// Function to get CORS headers - NEVER USE WILDCARD with credentials
function getCorsHeaders(req: Request) {
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': getAllowedOrigin(req)
  };
}

const FUNCTION_NAME = 'brief-operations';

// Request deduplication cache with expiration
// This helps prevent duplicate submissions (especially during development)
const requestCache = new Map<string, Response>();

// Clean up old cache entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    // Remove entries older than 2 minutes
    if ((value as any).timestamp && now - (value as any).timestamp > 120000) {
      requestCache.delete(key);
      console.log(`Removed expired request cache entry: ${key}`);
    }
  }
}, 300000);  // 5 minutes

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function createSupabaseClient(serviceRole: boolean = false): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = serviceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    : Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(supabaseUrl, supabaseKey);
}

async function authenticateUser(req: Request): Promise<User> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new HttpError('Missing Authorization header', 401);
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new HttpError(error?.message || 'Invalid or expired token', 401);
  return user;
}

async function trackEvent(supabaseAdmin: SupabaseClient, eventName: string, userId: string, properties?: object) {
  try {
    await supabaseAdmin.from('search_events').insert({
      event_name: eventName,
      user_id: userId,
      properties: properties || {}
    });
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
}

async function listBriefs(supabaseAdmin: SupabaseClient, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .select('id, title, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new HttpError('Failed to fetch briefs', 500);
  
  return { briefs: data || [] };
}

async function getBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (error) throw new HttpError('Brief not found', 404);
  
  return { brief: data };
}

async function createBrief(supabaseAdmin: SupabaseClient, briefData: any, userId: string) {
  // Generate a UUID for the new brief
  const briefId = crypto.randomUUID();
  
  console.log('Creating brief with data:', JSON.stringify(briefData, null, 2));
  
  // Extract the main fields that exist as direct columns
  const { title, description } = briefData;
  
  // Store all form-specific fields in the requirements JSONB field
  // This follows the table schema design where these fields aren't direct columns
  const requirements = {
    reference_companies: briefData.reference_companies || [],
    maturity: briefData.maturity || [],
    geographies: briefData.geographies || [],
    organization_types: briefData.organization_types || [],
    capabilities: briefData.capabilities || [],
    // Include any existing requirements data
    ...(briefData.requirements || {})
  };
  
  // Prepare the brief record according to the actual database schema
  const briefRecord = {
    id: briefId,
    user_id: userId,
    title: title || 'Untitled Brief',
    description: description || '',
    status: 'draft',
    requirements,
    locale: 'en', // Default locale
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Inserting brief record:', JSON.stringify(briefRecord, null, 2));
  
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .insert(briefRecord)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating brief:', error);
    throw new HttpError(`Failed to create brief: ${error.message}`, 500);
  }
  
  return { brief: data };
}

async function updateBrief(supabaseAdmin: SupabaseClient, briefId: string, briefData: any, userId: string) {
  // First, check if the brief exists and belongs to the user
  const { data: existingBrief, error: checkError } = await supabaseAdmin
    .from('briefs')
    .select('id')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (checkError || !existingBrief) throw new HttpError('Brief not found', 404);
  
  // Update the brief
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .update({
      ...briefData,
      updated_at: new Date().toISOString()
    })
    .eq('id', briefId)
    .select()
    .single();
    
  if (error) throw new HttpError('Failed to update brief', 500);
  
  return { brief: data };
}

async function deleteBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // First, check if the brief exists and belongs to the user
  const { data: existingBrief, error: checkError } = await supabaseAdmin
    .from('briefs')
    .select('id')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (checkError || !existingBrief) throw new HttpError('Brief not found', 404);
  
  // Delete the brief
  const { error } = await supabaseAdmin
    .from('briefs')
    .delete()
    .eq('id', briefId);
    
  if (error) throw new HttpError('Failed to delete brief', 500);
  
  return { success: true };
}

async function duplicateBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // First, get the brief to duplicate
  const { data: originalBrief, error: getError } = await supabaseAdmin
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (getError || !originalBrief) throw new HttpError('Brief not found', 404);
  
  // Generate a new UUID for the duplicate brief
  const newBriefId = crypto.randomUUID();
  
  // Create the duplicate brief
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .insert({
      id: newBriefId,
      user_id: userId,
      title: `${originalBrief.title} (Copy)`,
      status: 'draft',
      description: originalBrief.description,
      requirements: originalBrief.requirements,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw new HttpError('Failed to duplicate brief', 500);
  
  return { brief: data };
}

// Utilisation de la fonction importée - pas besoin de redéfinir

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    // 1. Authentication
    const user = await authenticateUser(req);
    
    // 2. Parse request body
    let requestBody = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch (error) {
      throw new HttpError('Invalid request body', 400);
    }
    
    const { action, brief_id, request_id, ...params } = requestBody as any;
    
    // Check for duplicate requests using request_id from body only
    if (action === 'create_brief' && request_id) {
      if (requestCache.has(request_id)) {
        console.log(`Duplicate request detected: ${request_id}`);
        return requestCache.get(request_id) as Response;
      }
    }
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result;
    
    switch (action) {
      case 'list_briefs':
        result = await listBriefs(supabaseAdmin, user.id);
        break;
        
      case 'get_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await getBrief(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'create_brief':
        result = await createBrief(supabaseAdmin, params, user.id);
        break;
        
      case 'update_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await updateBrief(supabaseAdmin, brief_id, params, user.id);
        break;
        
      case 'delete_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await deleteBrief(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'duplicate_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await duplicateBrief(supabaseAdmin, brief_id, user.id);
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }

    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { brief_id, ...params });

    // 5. Response
    // Define the base CORS headers structure
    const corsHeaders = {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // 24 heures pour optimiser
    };

    // Create a properly structured response for the frontend
    // Standardize response structure for all actions
    let responseBody = {
      success: true,
      data: result
    };
    
    // For list_briefs action, ensure briefs are available at the expected path
    if (action === 'list_briefs') {
      responseBody = {
        success: true,
        briefs: result.briefs,
        data: {
          briefs: result.briefs
        }
      };
    }
    // For other actions, make sure brief data is accessible at multiple paths for compatibility
    else if (result?.brief) {
      responseBody = {
        success: true,
        data: {
          brief: result.brief,
          brief_id: result.brief.id
        },
        brief: result.brief,
        brief_id: result.brief.id
      };
    }

    // Log the response structure to help with debugging
    console.log('Response structure:', JSON.stringify(responseBody, null, 2));

    const responseFinal = new Response(JSON.stringify(responseBody), {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });

    // Cache the response for duplicate request detection (using body request_id only)
    if ((action === 'create_brief' || action === 'update_brief') && request_id) {
      // Add timestamp to allow cache cleanup
      const cachedResponse = responseFinal.clone();
      (cachedResponse as any).timestamp = Date.now();
      requestCache.set(request_id, cachedResponse);
      console.log(`Cached response for request ID: ${request_id}`);
      
      // Auto-cleanup this specific request after 2 minutes
      setTimeout(() => {
        requestCache.delete(request_id);
      }, 120000); // 2 minutes
    }
    
    return responseFinal;
  } catch (error) {
    console.error(`Error in ${FUNCTION_NAME}:`, error);
    
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Create supabase admin client for error logging
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system', { error: errorMessage });
    } catch (loggingError) {
      console.error('Failed to log error event:', loggingError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: statusCode,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
  }
});
