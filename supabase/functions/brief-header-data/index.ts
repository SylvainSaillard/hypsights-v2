// supabase/functions/brief-header-data/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// Standard CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // More specific origin in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FUNCTION_NAME = 'brief-header-data';

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
      const { error } = await supabaseAdmin.from('search_events').insert({
        event_name: eventName,
        user_id: userId,
        properties: properties || {}
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Failed to track event ${eventName}:`, error.message);
    }
}

async function getBriefHeaderData(supabaseAdmin: SupabaseClient, userId: string, briefId: string) {
  if (!briefId) {
    throw new HttpError('Missing briefId parameter', 400);
  }

  // Get Brief Details
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('title, created_at')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();

  if (briefError) {
    console.error(`[${FUNCTION_NAME}] Error fetching brief details:`, briefError);
    throw new HttpError('Failed to fetch brief details or access denied', 404);
  }
  if (!briefId) {
    throw new HttpError('Missing briefId parameter', 400);
  }

  // KPI: Solutions count
  const { count: solutionsCount, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('id', { count: 'exact', head: true })
    .eq('brief_id', briefId);

  if (solutionsError) {
    console.error(`[${FUNCTION_NAME}] Error fetching solutions count:`, solutionsError);
    throw new HttpError('Failed to fetch solutions count', 500);
  }

  // KPI: Suppliers and Products count
  const { data: suppliers, error: suppliersError } = await supabaseAdmin
    .from('suppliers')
    .select('id, products_summary, company_info')
    .eq('brief_id', briefId);

  if (suppliersError) {
    console.error(`[${FUNCTION_NAME}] Error fetching suppliers:`, suppliersError);
    throw new HttpError('Failed to fetch suppliers', 500);
  }

  const suppliersCount = suppliers?.length || 0;
  const productsCount = suppliers?.reduce((acc, s) => acc + (s.products_summary?.length || 0), 0) || 0;

  // Structured Filters Aggregation
  const structuredFilters = {
    geographies: new Set<string>(),
    organization_types: new Set<string>(),
    capabilities: new Set<string>(),
    maturity: new Set<string>(),
  };

  suppliers?.forEach(supplier => {
    const info = supplier.company_info;
    if (info?.geography) structuredFilters.geographies.add(info.geography);
    if (info?.organization_type) structuredFilters.organization_types.add(info.organization_type);
    if (info?.capabilities && Array.isArray(info.capabilities)) {
        info.capabilities.forEach(cap => structuredFilters.capabilities.add(cap));
    }
    if (info?.maturity) structuredFilters.maturity.add(info.maturity);
  });

  const aggregatedFilters = {
      geographies: Array.from(structuredFilters.geographies),
      organization_types: Array.from(structuredFilters.organization_types),
      capabilities: Array.from(structuredFilters.capabilities),
      maturity: Array.from(structuredFilters.maturity),
  };

  return {
    brief: {
        title: brief.title,
        created_at: brief.created_at
    },
    kpis: {
      solutions: solutionsCount || 0,
      companies: suppliersCount,
      products: productsCount,
    },
    structured_filters: aggregatedFilters,
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const user = await authenticateUser(req);
    const { briefId } = await req.json();

    const supabaseAdmin = createSupabaseClient(true);
    const data = await getBriefHeaderData(supabaseAdmin, user.id, briefId);

    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_success`, user.id, { briefId });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    const statusCode = error instanceof HttpError ? error.status : 500;
    
    // Attempt to track error without exposing user object if auth failed
    try {
        const supabaseAdmin = createSupabaseClient(true);
        await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system_error', { error: error.message });
    } catch(e) {
        console.error(`[${FUNCTION_NAME}] Failed to track error event`, e);
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: statusCode,
    });
  }
});
