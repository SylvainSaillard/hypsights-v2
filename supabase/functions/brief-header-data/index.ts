// supabase/functions/brief-header-data/index.ts

// @deno-ts-ignore
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
  'http://127.0.0.1:52531' // Common Vite dev port
];

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id, accept, accept-encoding, accept-language, cache-control, pragma',
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

  // Get Brief Details, including structured filters
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();

  if (briefError) {
    console.error(`[${FUNCTION_NAME}] Error fetching brief details:`, briefError);
    throw new HttpError('Failed to fetch brief details or access denied', 404);
  }

  // KPI: Solutions count
  const { count: solutionsCount, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('id', { count: 'exact', head: true })
    .eq('brief_id', briefId);

  if (solutionsError) {
    console.error(`[${FUNCTION_NAME}] Error fetching solutions count:`, solutionsError);
  }

  // KPI: Fast searches used count
  const { count: fastSearchesUsed, error: fastSearchesError } = await supabaseAdmin
    .from('solutions')
    .select('id', { count: 'exact', head: true })
    .eq('brief_id', briefId)
    .not('fast_search_launched_at', 'is', null);

  if (fastSearchesError) {
    console.error(`[${FUNCTION_NAME}] Error fetching fast searches count:`, fastSearchesError);
  }

  // Step 1: Use the join table `supplier_match_profiles` to find suppliers for the brief.
  const { data: supplierMatches, error: matchError } = await supabaseAdmin
    .from('supplier_match_profiles')
    .select('supplier_id')
    .eq('brief_id', briefId);

  if (matchError) {
    console.error(`[${FUNCTION_NAME}] Error fetching supplier matches:`, matchError);
    throw new HttpError('Failed to fetch supplier matches', 500);
  }

  const supplierIdsFromMatches = supplierMatches.map(m => m.supplier_id).filter(id => id);

  let suppliers: any[] = [];
  if (supplierIdsFromMatches.length > 0) {
    const { data: fetchedSuppliers, error: suppliersError } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .in('id', supplierIdsFromMatches);

    if (suppliersError) {
      console.error(`[${FUNCTION_NAME}] Database error fetching suppliers:`, JSON.stringify(suppliersError, null, 2));
      throw new HttpError('Failed to fetch suppliers', 500);
    }
    suppliers = fetchedSuppliers;
  }

  console.log(`[${FUNCTION_NAME}] Successfully fetched suppliers. Count: ${suppliers.length}`);

  const suppliersCount = suppliers?.length || 0;
  const supplierIds = suppliers?.map(s => s.id) || [];
  let productsCount = 0;

  // Step 2: If suppliers exist, count their associated products.
  if (suppliersCount > 0) {
    const { count, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .in('supplier_id', supplierIds);

    if (productsError) {
      console.error(`[${FUNCTION_NAME}] Error fetching products count:`, productsError);
      // Do not throw, return partial data instead
    } else {
      productsCount = count || 0;
    }
  }

  /* --- DEPRECATED (2024-07-15): Aggregate filters from search results ---
     This logic aggregates filters from the suppliers found. It's kept for reference
     in case we want to display both defined brief filters and resulting filters.

      const structuredFilters = {
        geographies: new Set<string>(),
        organization_types: new Set<string>(),
        capabilities: new Set<string>(),
      };

      suppliers.forEach(supplier => {
        if (supplier.country) structuredFilters.geographies.add(supplier.country);
        if (supplier.company_size) structuredFilters.organization_types.add(supplier.company_size);
        if (supplier.industry) structuredFilters.capabilities.add(supplier.industry);
      });

      const aggregatedFiltersFromSuppliers = {
        geographies: Array.from(structuredFilters.geographies),
        organization_types: Array.from(structuredFilters.organization_types),
        capabilities: Array.from(structuredFilters.capabilities),
      };
  */

  // Step 3: Use structured filters directly from the brief (Source of Truth)
  const aggregatedFilters = {
    geographies: brief.geographies || [],
    organization_types: brief.organization_types || [],
    capabilities: brief.capabilities || [],
    maturity: brief.maturity || [],
    reference_companies: brief.reference_companies || [],
  };

  return {
    ...brief,
    solutions_count: solutionsCount || 0,
    suppliers_count: suppliersCount,
    products_count: productsCount,
    fast_searches_used: fastSearchesUsed || 0
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const user = await authenticateUser(req);
    const { brief_id: briefId } = await req.json();

    const supabaseAdmin = createSupabaseClient(true);
    const data = await getBriefHeaderData(supabaseAdmin, user.id, briefId);

    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_success`, user.id, { briefId });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    const statusCode = error instanceof HttpError ? error.status : 500;
    
    // Attempt to track error without exposing user object if auth failed
    try {
        const supabaseAdmin = createSupabaseClient(true);
        // We don't have a user ID if auth fails, so we can't track it to a user.
        await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system_error', { error: error.message });
    } catch(e) {
        console.error(`[${FUNCTION_NAME}] Failed to track error event`, e);
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: statusCode,
    });
  }
});
