import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Template v1.0 - Standardized implementation
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://www.hypsights.com',
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

const FUNCTION_NAME = 'admin-data';

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

async function verifyAdminRole(supabaseAdmin: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('[verifyAdminRole] Error fetching user role:', error);
    return false;
  }
  
  return data?.role === 'admin';
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

// Get all users with their metadata
async function getAllUsers(supabaseAdmin: SupabaseClient) {
  console.log('[getAllUsers] Fetching all users with metadata');
  
  const { data: users, error } = await supabaseAdmin
    .from('users_metadata')
    .select(`
      user_id,
      role,
      fast_searches_quota,
      fast_searches_used,
      deep_searches_count,
      preferred_locale,
      onboarding_completed,
      created_at,
      last_active_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAllUsers] Error:', error);
    throw new HttpError('Failed to fetch users', 500);
  }

  // Get auth.users emails via service role
  const userIds = users?.map(u => u.user_id) || [];
  const usersWithEmail = await Promise.all(
    users?.map(async (userMeta) => {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userMeta.user_id);
        return {
          ...userMeta,
          email: authUser?.user?.email || 'Unknown'
        };
      } catch {
        return { ...userMeta, email: 'Unknown' };
      }
    }) || []
  );

  console.log(`[getAllUsers] Found ${usersWithEmail.length} users`);
  return usersWithEmail;
}

// Get all briefs from all users with stats
async function getAllBriefsWithStats(supabaseAdmin: SupabaseClient, filters?: { user_id?: string; status?: string }) {
  console.log('[getAllBriefsWithStats] Fetching all briefs with filters:', filters);

  let query = supabaseAdmin
    .from('briefs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data: briefs, error: briefsError } = await query;

  if (briefsError) {
    console.error('[getAllBriefsWithStats] Error fetching briefs:', briefsError);
    throw new HttpError('Failed to fetch briefs', 500);
  }

  if (!briefs || briefs.length === 0) {
    return [];
  }

  // Get user emails for all briefs
  const uniqueUserIds = [...new Set(briefs.map(b => b.user_id))];
  const userEmailMap: Record<string, string> = {};
  
  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        userEmailMap[userId] = authUser?.user?.email || 'Unknown';
      } catch {
        userEmailMap[userId] = 'Unknown';
      }
    })
  );

  // Get stats for each brief
  const briefsWithStats = await Promise.all(
    briefs.map(async (brief) => {
      try {
        const [
          { count: solutions_count },
          { count: suppliers_count },
          { count: products_count },
          { count: fast_searches_launched },
          { data: solutionsData }
        ] = await Promise.all([
          supabaseAdmin
            .from('solutions')
            .select('id', { count: 'exact', head: true })
            .eq('brief_id', brief.id),
          supabaseAdmin
            .from('supplier_match_profiles')
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
            .select('id, name, status, fast_search_launched_at, created_at')
            .eq('brief_id', brief.id)
            .order('created_at', { ascending: true })
        ]);

        return {
          ...brief,
          user_email: userEmailMap[brief.user_id] || 'Unknown',
          solutions_count: solutions_count || 0,
          suppliers_count: suppliers_count || 0,
          products_count: products_count || 0,
          fast_searches_launched: fast_searches_launched || 0,
          solutions: solutionsData || []
        };
      } catch (error) {
        console.error(`[getAllBriefsWithStats] Error getting stats for brief ${brief.id}:`, error);
        return {
          ...brief,
          user_email: userEmailMap[brief.user_id] || 'Unknown',
          solutions_count: 0,
          suppliers_count: 0,
          products_count: 0,
          fast_searches_launched: 0,
          solutions: []
        };
      }
    })
  );

  console.log(`[getAllBriefsWithStats] Returning ${briefsWithStats.length} briefs with stats`);
  return briefsWithStats;
}

// Get admin dashboard metrics
async function getAdminMetrics(supabaseAdmin: SupabaseClient) {
  console.log('[getAdminMetrics] Calculating admin metrics');

  const [
    { count: totalUsers },
    { count: totalBriefs },
    { count: activeBriefs },
    { count: totalSolutions },
    { count: totalSuppliers },
    { count: totalFastSearches }
  ] = await Promise.all([
    supabaseAdmin.from('users_metadata').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('briefs').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('briefs').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    supabaseAdmin.from('solutions').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('supplier_match_profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('solutions').select('id', { count: 'exact', head: true }).not('fast_search_launched_at', 'is', null)
  ]);

  // Get briefs created in last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { count: briefsThisWeek } = await supabaseAdmin
    .from('briefs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Get users active in last 7 days
  const { count: activeUsersThisWeek } = await supabaseAdmin
    .from('users_metadata')
    .select('id', { count: 'exact', head: true })
    .gte('last_active_at', oneWeekAgo.toISOString());

  return {
    totalUsers: totalUsers || 0,
    totalBriefs: totalBriefs || 0,
    activeBriefs: activeBriefs || 0,
    totalSolutions: totalSolutions || 0,
    totalSuppliers: totalSuppliers || 0,
    totalFastSearches: totalFastSearches || 0,
    briefsThisWeek: briefsThisWeek || 0,
    activeUsersThisWeek: activeUsersThisWeek || 0
  };
}

// Handle different admin actions
async function handleAction(action: string, params: any, user: User, supabaseAdmin: SupabaseClient) {
  console.log(`[handleAction] Action: ${action}, Params:`, params);

  // Verify admin role for all actions
  const isAdmin = await verifyAdminRole(supabaseAdmin, user.id);
  if (!isAdmin) {
    throw new HttpError('Access denied. Admin privileges required.', 403);
  }

  switch (action) {
    case 'get_admin_metrics':
      return await getAdminMetrics(supabaseAdmin);
    case 'get_all_users':
      return await getAllUsers(supabaseAdmin);
    case 'get_all_briefs':
      return await getAllBriefsWithStats(supabaseAdmin, params);
    default:
      throw new HttpError(`Unknown action: ${action}`, 400);
  }
}

async function parseParams(req: Request) {
  let params: any = {};
  let action = 'get_admin_metrics';
  
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
  console.log(`[${FUNCTION_NAME}] Request received. Method: ${req.method}, Origin: ${req.headers.get('origin')}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    const user = await authenticateUser(req);
    console.log(`[${FUNCTION_NAME}] User authenticated: ${user.id} (${user.email})`);
    
    const supabaseAdmin = createSupabaseClient(true);
    const { action, params } = await parseParams(req);
    console.log(`[${FUNCTION_NAME}] Executing action: '${action}'`);
    
    const result = await handleAction(action, params, user, supabaseAdmin);
    console.log(`[${FUNCTION_NAME}] Action '${action}' successful`);
    
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, params);
    
    return corsResponse({ success: true, data: result }, req);
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system', { error: errorMessage });
    } catch (loggingError) {
      console.error(`[${FUNCTION_NAME}] Failed to log error:`, loggingError);
    }
    
    return corsResponse({ success: false, error: errorMessage }, req, { status: statusCode });
  }
});
