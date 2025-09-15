import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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

function corsResponse(data: any, req: Request, init: ResponseInit = {}): Response {
  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      ...init,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    }
  );
}

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

async function getBriefsWithStats(supabaseAdmin: SupabaseClient, userId: string) {
  console.log(`[getBriefsWithStats] Starting for user: ${userId}`);
  // 1. Get all non-archived briefs for the user
  console.log('[getBriefsWithStats] Fetching active briefs for user:', userId);
  const { data: briefs, error: briefsError } = await supabaseAdmin
    .from('briefs')
    .select('*, deep_search_requested')
    .eq('user_id', userId)
    .neq('status', 'archived') // Exclude archived briefs
    .order('created_at', { ascending: false });

  if (briefsError) {
    console.error('[getBriefsWithStats] Error fetching briefs:', briefsError);
    throw new HttpError('Failed to fetch briefs', 500);
  }
  if (!briefs) {
    console.log('[getBriefsWithStats] No briefs found for user.');
    return [];
  }
  console.log(`[getBriefsWithStats] Found ${briefs.length} briefs.`);

  // 2. For each brief, get stats
  const briefsWithStats = await Promise.all(
    briefs.map(async (brief) => {
      console.log(`[getBriefsWithStats] Getting stats for brief: ${brief.id}`);
      try {
        // Get supplier matches first
        const { data: matchedSuppliers, error: matchedSuppliersError } = await supabaseAdmin
          .from('supplier_match_profiles')
          .select('supplier_id')
          .eq('brief_id', brief.id);

        if (matchedSuppliersError) {
          console.error(`[getBriefsWithStats] Error fetching matched suppliers for brief ${brief.id}:`, matchedSuppliersError);
          // Continue with 0 counts if this fails
        }

        const supplierIds = matchedSuppliers?.map(s => s.supplier_id) || [];
        const suppliers_count = supplierIds.length;

        // Get other stats
        const [
          { count: solutions_count, error: solutionsError },
          { count: products_count, error: productsError },
          { count: fast_searches_used, error: fastSearchesError },
          { count: active_solutions_count, error: activeSolutionsError }
        ] = await Promise.all([
          supabaseAdmin
            .from('solutions')
            .select('id', { count: 'exact', head: true })
            .eq('brief_id', brief.id),
          supabaseAdmin
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('brief_id', brief.id),
          supabaseAdmin
            .from('solutions')
            .select('id', { count: 'exact', head: true })
            .eq('brief_id', brief.id)
            .not('fast_search_launched_at', 'is', null),
          supabaseAdmin
            .from('solutions')
            .select('id', { count: 'exact', head: true })
            .eq('brief_id', brief.id)
            .eq('status', 'in_progress')
        ]);

        if (solutionsError) console.error(`[getBriefsWithStats] Error getting solutions count for brief ${brief.id}:`, solutionsError);
        if (productsError) console.error(`[getBriefsWithStats] Error getting products count for brief ${brief.id}:`, productsError);
        if (fastSearchesError) console.error(`[getBriefsWithStats] Error getting fast searches count for brief ${brief.id}:`, fastSearchesError);
        if (activeSolutionsError) console.error(`[getBriefsWithStats] Error getting active solutions count for brief ${brief.id}:`, activeSolutionsError);

        const hasActiveSolutions = (active_solutions_count || 0) > 0;
        console.log(`[getBriefsWithStats] Stats for brief ${brief.id}: solutions=${solutions_count}, suppliers=${suppliers_count}, products=${products_count}, fast_searches=${fast_searches_used}, active_solutions=${active_solutions_count}, has_active=${hasActiveSolutions}`);

        return {
          ...brief,
          solutions_count: solutions_count || 0,
          suppliers_count: suppliers_count || 0,
          products_count: products_count || 0,
          fast_searches_used: fast_searches_used || 0,
          has_active_solutions: hasActiveSolutions,
          active_solutions_count: active_solutions_count || 0,
        };
      } catch (error) {
        console.error(`[getBriefsWithStats] Failed to get stats for brief ${brief.id}:`, error);
        return {
          ...brief,
          solutions_count: 0,
          products_count: 0,
          suppliers_count: 0,
          fast_searches_used: 0,
          has_active_solutions: false,
          active_solutions_count: 0,
        };
      }
    })
  );

  console.log('[getBriefsWithStats] Finished. Returning briefs with stats.');
  return briefsWithStats;
}

async function getUserMetrics(supabaseAdmin: SupabaseClient, userId: string) {
  console.log(`[getUserMetrics] Starting for user: ${userId}`);
  let userMetadata: any = {
    fast_searches_quota: 3,
    fast_searches_used: 0,
    deep_searches_count: 0,
    completedSearches: 0
  };
  
  let activeBriefs = 0;
  let suppliersFound = 0;
  
  try {
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users_metadata')
      .select('fast_searches_quota, fast_searches_used, deep_searches_count')
      .eq('user_id', userId)
      .single();
      
    if (!userError && userData) {
      userMetadata = userData;
    } else {
      console.log(`[getUserMetrics] No user metadata found for ${userId}, using defaults.`);
      try {
        await supabaseAdmin.from('users_metadata').insert({
          user_id: userId,
          fast_searches_quota: 3,
          fast_searches_used: 0,
          deep_searches_count: 0
        });
      } catch (insertError) {
        console.error('[getUserMetrics] Failed to create default user metadata:', insertError);
      }
    }
  } catch (error) {
    console.error('[getUserMetrics] Error fetching user metadata:', error);
  }
  
  try {
    console.log(`[getUserMetrics] Fetching briefs for user: ${userId}`);
    const { data: userBriefs, error: briefsError } = await supabaseAdmin
      .from('briefs')
      .select('id')
      .eq('user_id', userId)
      .neq('status', 'archived');
      
    if (briefsError) {
      console.error('[getUserMetrics] Error fetching briefs for metrics:', briefsError);
    } else if (userBriefs) {
      activeBriefs = userBriefs.length;
      console.log(`[getUserMetrics] Found ${activeBriefs} active briefs.`);
      const briefIds = userBriefs.map(b => b.id);
      
      if (briefIds.length > 0) {
        // Calculate suppliersFound from supplier_match_profiles
        const { count: suppliersCount, error: suppliersError } = await supabaseAdmin
          .from('supplier_match_profiles')
          .select('id', { count: 'exact', head: true })
          .in('brief_id', briefIds);

        if (suppliersError) {
          console.error('[getUserMetrics] Error fetching supplier_match_profiles count:', suppliersError);
        } else {
          suppliersFound = suppliersCount || 0;
          console.log(`[getUserMetrics] Found ${suppliersFound} suppliers.`);
        }

        // Calculate completedSearches from solutions with status 'finished'
        const { count: searchesCount, error: searchesError } = await supabaseAdmin
          .from('solutions')
          .select('id', { count: 'exact', head: true })
          .in('brief_id', briefIds)
          .eq('status', 'finished');

        if (searchesError) {
          console.error('[getUserMetrics] Error fetching finished solutions count:', searchesError);
        } else {
          userMetadata.completedSearches = searchesCount || 0;
          console.log(`[getUserMetrics] Found ${userMetadata.completedSearches} completed searches.`);
        }

        // Calculate REAL fast searches used from solutions with fast_search_launched_at
        const { count: realFastSearchesUsed, error: fastSearchError } = await supabaseAdmin
          .from('solutions')
          .select('id', { count: 'exact', head: true })
          .in('brief_id', briefIds)
          .not('fast_search_launched_at', 'is', null);

        if (fastSearchError) {
          console.error('[getUserMetrics] Error fetching real fast searches count:', fastSearchError);
        } else {
          userMetadata.fast_searches_used = realFastSearchesUsed || 0;
          console.log(`[getUserMetrics] Found ${userMetadata.fast_searches_used} real fast searches used.`);
        }
      }
    }
  } catch (error) {
    console.error('[getUserMetrics] Error fetching briefs/suppliers metrics:', error);
  }
  
  const metrics = {
    activeBriefs: activeBriefs || 0,
    completedSearches: userMetadata.completedSearches || 0,
    suppliersFound: suppliersFound || 0,
    fast_searches_used: userMetadata.fast_searches_used || 0,
    fast_searches_quota: userMetadata.fast_searches_quota || 3,
  };

  console.log('[getUserMetrics] Returning metrics:', JSON.stringify(metrics));
  return metrics;
}

async function archiveBrief(supabaseAdmin: SupabaseClient, userId: string, briefId: string) {
  console.log(`[archiveBrief] Attempting to archive brief ${briefId} for user ${userId}`);

  if (!briefId) {
    throw new HttpError('Brief ID is required', 400);
  }

  const { error } = await supabaseAdmin
    .from('briefs')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', briefId)
    .eq('user_id', userId); // Ensure user can only archive their own briefs

  if (error) {
    console.error(`[archiveBrief] Error archiving brief ${briefId}:`, error);
    throw new HttpError('Failed to archive brief', 500);
  }

  console.log(`[archiveBrief] Brief ${briefId} archived successfully.`);
  return { success: true, message: `Brief ${briefId} archived.` };
}

// Handle different dashboard actions
async function handleAction(action: string, params: any, user: User, supabaseAdmin: SupabaseClient) {
  console.log(`Handling action: ${action} with params:`, params);
  
  switch (action) {
    case 'get_user_metrics':
      return await getUserMetrics(supabaseAdmin, user.id);
    case 'get_briefs_with_stats':
      return await getBriefsWithStats(supabaseAdmin, user.id);
    case 'archive_brief':
      return await archiveBrief(supabaseAdmin, user.id, params.brief_id);
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
  // Enhanced logging for debugging CORS and request entry
  console.log(`[${FUNCTION_NAME}] Request received. Method: ${req.method}, Origin: ${req.headers.get('origin')}, URL: ${req.url}`);
  console.log(`[${FUNCTION_NAME}] Received ${req.method} from ${req.headers.get('origin')}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    const user = await authenticateUser(req);
    console.log(`[${FUNCTION_NAME}] User authenticated: ${user.id} (${user.email})`);
    
    const supabaseAdmin = createSupabaseClient(true);
    const { action, params } = await parseParams(req);
    console.log(`[${FUNCTION_NAME}] Executing action: '${action}' with params:`, params);
    
    const result = await handleAction(action, params, user, supabaseAdmin);
    console.log(`[${FUNCTION_NAME}] Action '${action}' successful. Returning result.`);
    
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, params);
    
    return corsResponse({ success: true, data: result }, req);
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Top-level error:`, error);
    
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system', { error: errorMessage });
    } catch (loggingError) {
      console.error(`[${FUNCTION_NAME}] Failed to log error event:`, loggingError);
    }
    
    return corsResponse({ success: false, error: errorMessage }, req, { status: statusCode });
  }
});
