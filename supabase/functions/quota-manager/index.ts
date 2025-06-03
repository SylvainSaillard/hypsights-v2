import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
  // Get user quota from users_metadata
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .select('fast_searches_quota, fast_searches_used')
    .eq('user_id', userId)
    .single();
    
  if (error) throw new HttpError('Failed to fetch user quota', 500);
  
  return {
    quota: {
      limit: data.fast_searches_quota,
      used: data.fast_searches_used,
      remaining: data.fast_searches_quota - data.fast_searches_used
    }
  };
}

async function checkQuotaAvailability(supabaseAdmin: SupabaseClient, userId: string) {
  // Check if user has available quota for a fast search
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .select('fast_searches_quota, fast_searches_used')
    .eq('user_id', userId)
    .single();
    
  if (error) throw new HttpError('Failed to fetch user quota', 500);
  
  const available = data.fast_searches_used < data.fast_searches_quota;
  
  return {
    available,
    quota: {
      limit: data.fast_searches_quota,
      used: data.fast_searches_used,
      remaining: data.fast_searches_quota - data.fast_searches_used
    }
  };
}

async function incrementQuotaUsage(supabaseAdmin: SupabaseClient, userId: string) {
  // First check if quota is available
  const { available, quota } = await checkQuotaAvailability(supabaseAdmin, userId);
  
  if (!available) {
    throw new HttpError('Fast search quota exceeded', 403);
  }
  
  // Increment quota usage
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .update({
      fast_searches_used: quota.used + 1,
      last_active_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select('fast_searches_quota, fast_searches_used')
    .single();
    
  if (error) throw new HttpError('Failed to update quota usage', 500);
  
  return {
    success: true,
    quota: {
      limit: data.fast_searches_quota,
      used: data.fast_searches_used,
      remaining: data.fast_searches_quota - data.fast_searches_used
    }
  };
}

async function resetQuota(supabaseAdmin: SupabaseClient, userId: string, isAdmin: boolean) {
  // Only admins can reset quota
  if (!isAdmin) {
    throw new HttpError('Unauthorized - Admin access required', 403);
  }
  
  // Reset quota usage
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .update({ fast_searches_used: 0 })
    .eq('user_id', userId)
    .select('fast_searches_quota, fast_searches_used')
    .single();
    
  if (error) throw new HttpError('Failed to reset quota', 500);
  
  return {
    success: true,
    quota: {
      limit: data.fast_searches_quota,
      used: data.fast_searches_used,
      remaining: data.fast_searches_quota - data.fast_searches_used
    }
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    
    const { action, user_id } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // Check if user is admin (for specific actions)
    const isAdmin = user.app_metadata?.role === 'admin';
    
    // Use the specified user_id if admin, otherwise use the authenticated user's id
    const targetUserId = (isAdmin && user_id) ? user_id : user.id;
    
    // 3. Business logic based on action
    let result;
    
    switch (action) {
      case 'get_quota':
        result = await getUserQuota(supabaseAdmin, targetUserId);
        break;
        
      case 'check_availability':
        result = await checkQuotaAvailability(supabaseAdmin, targetUserId);
        break;
        
      case 'increment_usage':
        result = await incrementQuotaUsage(supabaseAdmin, targetUserId);
        break;
        
      case 'reset_quota':
        result = await resetQuota(supabaseAdmin, targetUserId, isAdmin);
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { targetUserId });
    
    // 5. Response
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: {
        ...corsHeaders,
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
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
