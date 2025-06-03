---
trigger: always_on
---

# Hypsights V2 -Complete Architecture Context

## Application Overview
Hypsights V2 is a B2B web platform that helps professional users find suppliers and products for their business needs through AI-assisted search.

### Core User Journey:
1. **Brief Creation** - Users describe their business need via structured form
2. **AI Interaction** - AI assistant helps refine the brief and suggests solutions
3. **Solution Validation** - Users validate AI-proposed solutions to unlock search
4. **Fast Search** - Automated search (quota-limited: 3 free searches)
5. **Deep Search** - Manual expert research (unlimited, lead generation)

### Key Business Rules:
- Desktop-first B2B interface with professional UX
- Quota system limits Fast Searches (3 free, unlimited paid)
- Deep Search generates leads for human follow-up
- Multi-language support (FR/EN priority)
- All searches require validated solutions (prevents quota waste)
- Brief statuses: draft → active (after first search)

## Core Architecture
- **Backend**: Supabase (PostgreSQL) + Edge Functions (TypeScript)
- **Frontend**: Ultra-lightweight React (useState + fetch only)
- **Workflow**: N8n for complex integrations and AI workflows
- **Pattern**: Thin Client / Fat Edge (all business logic server-side)
- **Analytics**: Server-side tracking with PostHog integration
- **i18n**: Server-side translation management

## Development Strategy - KISS Principles
- **ALWAYS use production Edge Functions** - No mock data, no development modes
- **Single data source** - Real Supabase backend only, always
- **Consistent authentication** - JWT for user actions, ANON for public endpoints
- **No development/production switches** - Same behavior everywhere
- **KISS principle** - Keep It Simple, Stupid - avoid complexity
- **Real infrastructure testing** - Debug on actual Supabase from day 1
- **Immediate feedback** - See real data flow and catch integration issues early

## Code Standards

### Edge Function Standard Pattern
```typescript
export async function handler(req: Request) {
  // Handle CORS for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

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

### React Component Standard Pattern  
```typescript
function Component({ briefId, onAction }) {
  // Data fetching via Edge Functions ONLY - no mock data ever
  const { data, loading, error, refresh } = useEdgeFunction('endpoint-name', {
    brief_id: briefId
  });
  
  // Simple event handlers that call Edge Functions
  const handleAction = async (actionData) => {
    try {
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || SUPABASE_ANON_KEY;

      await fetch('/functions/v1/endpoint', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'do_something', ...actionData })
      });
      
      refresh(); // Refresh data after action
      onAction?.(); // Notify parent if needed
    } catch (error) {
      console.error('Action failed:', error);
    }
  };
  
  // Pure rendering logic
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} onRetry={refresh} />;
  if (!data) return <EmptyStateComponent />;
  
  return (
    <div className="component-container">
      <DisplayComponent data={data} />
      <ActionButton onClick={() => handleAction(someData)} />
    </div>
  );
}
```

### Authentication Strategy
```typescript
// Clear rule: 
// - Public actions (signup/login) → ANON_KEY
// - User actions (briefs/dashboard) → JWT TOKEN from session

const useEdgeFunction = (endpoint, params) => {
  // Always get user session token for authenticated calls
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;
  
  // Always call real Edge Functions - no mock mode
  fetch(`/functions/v1/${endpoint}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
};
```

### RLS Security Pattern
```sql
-- Standard pattern for all tables
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_access" ON table_name FOR ALL
USING (user_id = auth.uid() OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin');

CREATE POLICY "service_role_access" ON table_name FOR ALL TO service_role
USING (true) WITH CHECK (true);
