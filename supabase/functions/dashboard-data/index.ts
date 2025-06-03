import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

const FUNCTION_NAME = 'dashboard-data';

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

async function getUserMetrics(supabaseAdmin: SupabaseClient, userId: string) {
  let userMetadata = {
    fast_searches_quota: 3, // Default quota for new users
    fast_searches_used: 0,
    deep_searches_count: 0
  };
  
  let activeBriefs = 0;
  let suppliersFound = 0;
  
  try {
    // Get user quota and usage
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users_metadata')
      .select('fast_searches_quota, fast_searches_used, deep_searches_count')
      .eq('user_id', userId)
      .single();
      
    // Don't throw error, use defaults if no data found
    if (!userError && userData) {
      userMetadata = userData;
    } else {
      console.log(`No user metadata found for ${userId}, using defaults`);
      // Create default user metadata if it doesn't exist
      try {
        await supabaseAdmin.from('users_metadata').insert({
          user_id: userId,
          fast_searches_quota: 3,
          fast_searches_used: 0,
          deep_searches_count: 0
        });
      } catch (insertError) {
        console.error('Failed to create default user metadata:', insertError);
      }
    }
  } catch (error) {
    console.error('Error fetching user metadata:', error);
    // Continue with defaults
  }
  
  try {
    // Get active briefs count
    const { count, error } = await supabaseAdmin
      .from('briefs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (!error && count !== null) {
      activeBriefs = count;
    }
  } catch (error) {
    console.error('Error fetching briefs count:', error);
    // Continue with default value
  }
  
  try {
    // Get suppliers found count
    const { count, error } = await supabaseAdmin
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId);
      
    if (!error && count !== null) {
      suppliersFound = count;
    }
  } catch (error) {
    console.error('Error fetching suppliers count:', error);
    // Continue with default value
  }
  
  return {
    activeBriefs: activeBriefs || 0,
    completedSearches: (userMetadata.fast_searches_used || 0) + (userMetadata.deep_searches_count || 0),
    suppliersFound: suppliersFound || 0,
    quotaUsed: userMetadata.fast_searches_used || 0,
    quotaLimit: userMetadata.fast_searches_quota || 3
  };
}

// Handle different dashboard actions
async function handleAction(action: string, params: any, user: User, supabaseAdmin: SupabaseClient) {
  console.log(`Handling action: ${action} with params:`, params);
  
  switch (action) {
    case 'get_metrics':
      // Default action to get user metrics
      return { metrics: await getUserMetrics(supabaseAdmin, user.id) };
      
    default:
      throw new HttpError(`Unknown action: ${action}`, 400);
  }
}

// Parse parameters from either POST body or GET query string
async function parseParams(req: Request) {
  let params: any = {};
  let action = 'get_metrics'; // Default action
  
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      action = body.action || action;
      params = body;
    } catch (e) {
      console.log('Failed to parse JSON body:', e);
    }
  } else if (req.method === 'GET') {
    const url = new URL(req.url);
    action = url.searchParams.get('action') || action;
    params = Object.fromEntries(url.searchParams);
  }
  
  return { action, params };
}

serve(async (req: Request) => {
  // Get dynamic CORS headers based on the request
  const responseHeaders = {
    ...getCorsHeaders(req),
    'Content-Type': 'application/json'
  };
  
  // Log details of the request for debugging
  console.log(`${FUNCTION_NAME} received ${req.method} request from ${req.headers.get('origin') || 'unknown'}`);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: responseHeaders });
  }
  
  try {
    // 1. Authentication
    const user = await authenticateUser(req);
    console.log(`User authenticated: ${user.id}`);
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 2. Parse parameters and determine action
    const { action, params } = await parseParams(req);
    console.log(`Executing action: ${action}`);
    
    // 3. Business logic - Execute the appropriate action
    const result = await handleAction(action, params, user, supabaseAdmin);
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, params);
    
    // 5. Response
    return new Response(JSON.stringify({
      success: true,
      dashboard: result
    }), {
      headers: responseHeaders
    });
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
      headers: responseHeaders
    });
  }
});
