---
trigger: glob
globs: **/functions/**/*.ts
---

# Edge Functions Development Standards

## Mandatory Structure
- Always include user authentication check
- Use try-catch for error handling with CORS headers
- Log all operations to search_events table
- Return structured JSON responses
- Implement intelligent caching when appropriate

## Code Template
```typescript
export async function handler(req: Request) {
  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authentication
    const user = await authenticateUser(req);
    
    // 2. Input validation
    const { action, ...params } = await req.json();
    validateInput(params);
    
    // 3. Business logic
    const result = await executeBusinessLogic(action, params, user);
    
    // 4. Analytics tracking
    await trackEvent({
      event_name: `${functionName}_${action}_success`,
      user_id: user.id,
      properties: { ...params }
    });
    
    // 5. Response with CORS
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    // Error tracking
    await trackEvent({
      event_name: `${functionName}_error`,
      user_id: req.user?.id,
      properties: { error: error.message }
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
```

## Authentication Helper
```typescript
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid authentication token');
  }
  
  return user;
}
```

## Analytics Tracking Pattern
```typescript
async function trackEvent(event: {
  event_name: string;
  user_id?: string;
  properties: Record<string, any>;
}) {
  try {
    await supabase
      .from('search_events')
      .insert({
        user_id: event.user_id,
        type: event.event_name.split('_')[1] || 'other',
        source: 'edge_function',
        metadata: event.properties,
        launched_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Don't throw - analytics failure shouldn't break the main function
  }
}
```

## Caching Strategy
```typescript
async function getCachedOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached as T;
  }
  
  // Fetch fresh data
  const freshData = await fetchFn();
  
  // Cache for future use
  await setCache(cacheKey, freshData, ttlSeconds);
  
  return freshData;
}

async function getCache(key: string) {
  const { data } = await supabase
    .from('edge_function_cache')
    .select('data')
    .eq('cache_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();
    
  return data?.data;
}

async function setCache(key: string, data: any, ttlSeconds: number) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  
  await supabase
    .from('edge_function_cache')
    .upsert({
      cache_key: key,
      data: data,
      expires_at: expiresAt
    });
}
```

## Input Validation Pattern
```typescript
function validateInput(params: any, requiredFields: string[] = []) {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Sanitize string inputs
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      params[key] = value.trim();
    }
  }
  
  return params;
}
```

## Performance Requirements
- Cache expensive operations (5min TTL for dashboards)
- Use batch processing for multiple items
- Implement timeout handling (10s max)
- Optimize database queries with indexes
- Always use RLS policies for security

## Error Handling Best Practices
```typescript
// User-friendly error messages
const ERROR_MESSAGES = {
  'quota_exceeded': 'You have reached your search limit. Please upgrade to continue.',
  'invalid_solution': 'Please validate a solution before launching a search.',
  'network_error': 'Connection issue. Please try again.',
  'rate_limit': 'Too many requests. Please wait a moment.',
  'default': 'Something went wrong. Please try again or contact support.'
};

function getUserFriendlyError(error: string): string {
  return ERROR_MESSAGES[error] || ERROR_MESSAGES.default;
}
```

## Deployment Requirements
- Test locally with `supabase functions serve`
- Deploy with `supabase functions deploy function-name`
- Set environment variables with `supabase secrets set`
- Monitor logs in Supabase dashboard
- Verify CORS headers work in browser

## FORBIDDEN Practices
- ❌ Bypassing authentication for user data
- ❌ Not handling CORS properly
- ❌ Exposing sensitive data in error messages
- ❌ Missing analytics tracking
- ❌ Not validating input data
- ❌ Using synchronous operations for I/O
- ❌ Hardcoding configuration values