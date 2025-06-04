import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

const FUNCTION_NAME = 'search-handler';

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function createSupabaseClient(serviceRole = false) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = serviceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
    : Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(supabaseUrl, supabaseKey);
}

async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new HttpError('Missing Authorization header', 401);
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new HttpError(error?.message || 'Invalid or expired token', 401);
  return user;
}

async function trackEvent(supabaseAdmin, eventName, userId, properties) {
  try {
    await supabaseAdmin.from('analytics_events').insert({
      event_name: eventName,
      user_id: userId || 'system',
      properties: properties || {}
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

async function checkQuota(supabaseAdmin, userId) {
  // Get user's search quota information
  const { data: quotaData, error: quotaError } = await supabaseAdmin
    .from('users_metadata')
    .select('fast_searches_quota, fast_searches_used')
    .eq('user_id', userId)
    .single();
  
  if (quotaError) throw new HttpError(quotaError.message);
  
  // Set defaults if not found
  const searchQuotaLimit = quotaData?.fast_searches_quota ?? 3; // Default: 3 free searches
  const searchQuotaUsed = quotaData?.fast_searches_used ?? 0;
  
  // Check if quota exceeded
  if (searchQuotaUsed >= searchQuotaLimit) {
    throw new HttpError('Search quota exceeded. Please upgrade your plan.', 403);
  }
  
  return {
    quota_limit: searchQuotaLimit,
    quota_used: searchQuotaUsed,
    quota_remaining: searchQuotaLimit - searchQuotaUsed
  };
}

async function incrementQuotaUsed(supabaseAdmin, userId) {
  // Get current quota used
  const { data: quotaData, error: quotaError } = await supabaseAdmin
    .from('users_metadata')
    .select('fast_searches_used')
    .eq('user_id', userId)
    .single();
  
  if (quotaError && quotaError.code !== 'PGRST116') {
    throw new HttpError(quotaError.message);
  }
  
  const currentQuotaUsed = quotaData?.fast_searches_used ?? 0;
  const newQuotaUsed = currentQuotaUsed + 1;
  
  // Update quota used
  const { error: updateError } = await supabaseAdmin
    .from('users_metadata')
    .upsert({
      user_id: userId,
      fast_searches_used: newQuotaUsed,
      updated_at: new Date().toISOString()
    });
  
  if (updateError) throw new HttpError(updateError.message);
  
  return {
    quota_used: newQuotaUsed
  };
}

async function checkValidatedSolutions(supabaseAdmin, briefId, userId) {
  // Check if the brief exists and belongs to the user
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('id, status')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
  
  if (briefError) throw new HttpError('Brief not found or access denied', 404);
  
  // Check if any solutions are validated
  const { count, error: countError } = await supabaseAdmin
    .from('validated_solutions')
    .select('id', {
      count: 'exact',
      head: true
    })
    .eq('brief_id', briefId)
    .eq('user_id', userId);
  
  if (countError) throw new HttpError(countError.message);
  
  if (count === 0) {
    throw new HttpError('No validated solutions found. Please validate at least one solution before searching.', 400);
  }
  
  return {
    validated_solutions_count: count
  };
}

async function startFastSearch(supabaseAdmin, briefId, userId) {
  // Check quota
  const quota = await checkQuota(supabaseAdmin, userId);
  
  // Check if solutions are validated
  await checkValidatedSolutions(supabaseAdmin, briefId, userId);
  
  // Increment quota used
  await incrementQuotaUsed(supabaseAdmin, userId);
  
  // Get validated solutions
  const { data: validatedSolutions, error: validatedError } = await supabaseAdmin
    .from('validated_solutions')
    .select('solution_id')
    .eq('brief_id', briefId)
    .eq('user_id', userId);
  
  if (validatedError) throw new HttpError(validatedError.message);
  
  const solutionIds = validatedSolutions?.map((vs) => vs.solution_id) || [];
  
  // Get solution details
  const { data: solutions, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('id, name, description, category, tags')
    .in('id', solutionIds);
  
  if (solutionsError) throw new HttpError(solutionsError.message);
  
  // Update brief status to active if not already
  await supabaseAdmin
    .from('briefs')
    .update({
      status: 'active'
    })
    .eq('id', briefId)
    .eq('user_id', userId);
  
  // Log search event
  await supabaseAdmin
    .from('search_events')
    .insert({
      brief_id: briefId,
      user_id: userId,
      search_type: 'fast_search',
      solutions: solutions
    });
  
  // Simplified example: In production, this would trigger real search
  // using validated solutions as input
  // Return some mock search results for demonstration
  const mockProducts = [
    {
      id: '1',
      name: 'Premium Product Match',
      supplier: 'Top Supplier Inc',
      description: 'Perfect match for your requirements',
      price_range: '$1,000 - $5,000',
      match_score: 95,
      website: 'https://example.com/products/1',
      solution_id: solutionIds[0]
    },
    {
      id: '2',
      name: 'Standard Product Option',
      supplier: 'Quality Goods Ltd',
      description: 'Good match for most of your criteria',
      price_range: '$800 - $3,000',
      match_score: 85,
      website: 'https://example.com/products/2',
      solution_id: solutionIds[0]
    },
    {
      id: '3',
      name: 'Budget-Friendly Alternative',
      supplier: 'Value Solutions Co',
      description: 'Economical option meeting basic requirements',
      price_range: '$500 - $1,500',
      match_score: 70,
      website: 'https://example.com/products/3',
      solution_id: solutionIds.length > 1 ? solutionIds[1] : solutionIds[0]
    }
  ];
  
  return {
    search_id: crypto.randomUUID(),
    brief_id: briefId,
    products: mockProducts,
    solutions,
    quota_remaining: quota.quota_remaining - 1 // We've just used one
  };
}

async function requestDeepSearch(supabaseAdmin, briefId, userId, contactInfo) {
  // Check if solutions are validated
  await checkValidatedSolutions(supabaseAdmin, briefId, userId);
  
  // Validate contact info
  const contactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().optional(),
    message: z.string().optional()
  });
  
  const validatedContact = contactSchema.parse(contactInfo);
  
  // Get brief details
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('title, description')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
  
  if (briefError) throw new HttpError('Brief not found or access denied', 404);
  
  // Get validated solutions
  const { data: validatedSolutions, error: validatedError } = await supabaseAdmin
    .from('validated_solutions')
    .select('solution_id')
    .eq('brief_id', briefId)
    .eq('user_id', userId);
  
  if (validatedError) throw new HttpError(validatedError.message);
  
  const solutionIds = validatedSolutions?.map((vs) => vs.solution_id) || [];
  
  // Log deep search request
  const { data: searchEvent, error: searchEventError } = await supabaseAdmin
    .from('search_events')
    .insert({
      brief_id: briefId,
      user_id: userId,
      search_type: 'deep_search',
      contact_info: validatedContact,
      solutions: solutionIds
    })
    .select()
    .single();
  
  if (searchEventError) throw new HttpError(searchEventError.message);
  
  // Update brief status to active if not already
  await supabaseAdmin
    .from('briefs')
    .update({
      status: 'active'
    })
    .eq('id', briefId)
    .eq('user_id', userId);
  
  // Create a notification for the user
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Deep Search Request Received',
      content: `We've received your request for deep search on "${brief.title}". Our team will contact you shortly.`,
      type: 'deep_search',
      read: false
    });
  
  return {
    request_id: searchEvent.id,
    message: 'Your Deep Search request has been received. Our team will contact you shortly with curated results.'
  };
}

serve(async (req) => {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    // 1. Authentication
    let user;
    try {
      user = await authenticateUser(req);
    } catch (authError) {
      return corsResponse({
        success: false,
        error: 'Authentication failed. Please log in again.'
      }, req, { status: 401 });
    }
    
    // 2. Input validation
    const { action, brief_id, contact_info } = await req.json().catch(() => ({}));
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    if (!brief_id) {
      throw new HttpError('Missing required parameter: brief_id', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result;
    switch (action) {
      case 'check_quota':
        result = await checkQuota(supabaseAdmin, user.id);
        break;
      case 'start_fast_search':
        result = await startFastSearch(supabaseAdmin, brief_id, user.id);
        break;
      case 'request_deep_search':
        if (!contact_info) throw new HttpError('Missing required parameter: contact_info', 400);
        result = await requestDeepSearch(supabaseAdmin, brief_id, user.id, contact_info);
        break;
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, {
      brief_id
    });
    
    // 5. Response
    return corsResponse({ success: true, data: result }, req);
  } catch (error) {
    console.error(`Error in ${FUNCTION_NAME}:`, error);
    
    const isHttpError = error instanceof HttpError;
    const statusCode = isHttpError ? error.status : 500;
    const errorMessage = isHttpError ? error.message : 'An unexpected error occurred. Please try again.';
    
    // Error analytics
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, undefined, {
        error: errorMessage,
        status: statusCode
      });
    } catch (trackError) {
      console.error('Failed to track error:', trackError);
    }
    
    // Error response with CORS headers
    return corsResponse({ success: false, error: errorMessage }, req, { status: statusCode });
  }
});
