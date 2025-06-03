import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

const FUNCTION_NAME = 'quota-manager';

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

async function getUserQuota(supabaseAdmin: SupabaseClient, userId: string) {
  // Get user's quota
  const { data: userQuota, error } = await supabaseAdmin
    .from('user_quotas')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new HttpError('Failed to fetch user quota', 500);
  }
  
  // If user doesn't have a quota record yet, create one
  if (!userQuota) {
    const defaultQuota = {
      user_id: userId,
      fast_search_quota: 3, // Default 3 free searches
      fast_search_used: 0,
      deep_search_quota: 0, // Default no deep searches without payment
      deep_search_used: 0,
      reset_date: null, // No reset by default - one-time quota
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newQuota, error: insertError } = await supabaseAdmin
      .from('user_quotas')
      .insert(defaultQuota)
      .select()
      .single();
      
    if (insertError) throw new HttpError('Failed to create user quota', 500);
    
    return {
      quota: newQuota
    };
  }
  
  return {
    quota: userQuota
  };
}

async function checkQuota(supabaseAdmin: SupabaseClient, userId: string, quotaType: 'fast_search' | 'deep_search') {
  // Get user's quota
  const { quota } = await getUserQuota(supabaseAdmin, userId);
  
  // Check if user has quota left
  const quotaField = `${quotaType}_quota`;
  const usedField = `${quotaType}_used`;
  
  const hasQuotaLeft = quota[quotaField] > quota[usedField];
  
  return {
    quota,
    hasQuotaLeft,
    remaining: quota[quotaField] - quota[usedField]
  };
}

async function consumeQuota(supabaseAdmin: SupabaseClient, userId: string, quotaType: 'fast_search' | 'deep_search') {
  // Check quota first
  const { quota, hasQuotaLeft } = await checkQuota(supabaseAdmin, userId, quotaType);
  
  if (!hasQuotaLeft) {
    throw new HttpError(`No ${quotaType} quota left`, 403);
  }
  
  // Increment usage
  const usedField = `${quotaType}_used`;
  const { error } = await supabaseAdmin
    .from('user_quotas')
    .update({
      [usedField]: quota[usedField] + 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) throw new HttpError('Failed to update quota usage', 500);
  
  // Get updated quota
  return await getUserQuota(supabaseAdmin, userId);
}

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
    
    const { action, quota_type } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result;
    
    switch (action) {
      case 'get_quota':
        result = await getUserQuota(supabaseAdmin, user.id);
        break;
        
      case 'check_quota':
        if (!quota_type) throw new HttpError('Missing required parameter: quota_type', 400);
        if (!['fast_search', 'deep_search'].includes(quota_type)) {
          throw new HttpError('Invalid quota_type, must be "fast_search" or "deep_search"', 400);
        }
        result = await checkQuota(supabaseAdmin, user.id, quota_type);
        break;
        
      case 'consume_quota':
        if (!quota_type) throw new HttpError('Missing required parameter: quota_type', 400);
        if (!['fast_search', 'deep_search'].includes(quota_type)) {
          throw new HttpError('Invalid quota_type, must be "fast_search" or "deep_search"', 400);
        }
        result = await consumeQuota(supabaseAdmin, user.id, quota_type);
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { quota_type });
    
    // 5. Response
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
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
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
  }
});
