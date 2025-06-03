// @deno-types="https://deno.land/x/servest@v1.3.1/types/react/index.d.ts"
// Add Deno references to suppress TypeScript errors
/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FUNCTION_NAME = 'test-cors';

// This should use the client's actual origin in production
// For local development and testing, we can use a more permissive setting
const corsHeaders = {
  'Access-Control-Allow-Origin': req => req.headers.get('origin') || '*', // Dynamically set from request origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true' // Required for cookies/authorization
};

// Helper to get CORS headers based on the request
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': corsHeaders['Access-Control-Allow-Headers'],
    'Access-Control-Allow-Methods': corsHeaders['Access-Control-Allow-Methods'],
    'Access-Control-Allow-Credentials': corsHeaders['Access-Control-Allow-Credentials']
  };
};

// Authenticate user from request
async function authenticateUser(req: Request) {
  // Create Supabase client with Admin key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  // Get JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log('No Authorization header found');
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token found, verifying...');
  
  // Verify the JWT
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error) {
    console.error('Auth error:', error.message);
    return null;
  }
  
  console.log('User authenticated:', user?.id);
  return user;
}

// Track event for analytics
async function trackEvent(event: { event_name: string, user_id: string | undefined, properties: any }) {
  console.log('Tracking event:', event);
  // In production, this would write to your analytics table
}

serve(async (req: Request) => {
  const responseHeaders = {
    ...getCorsHeaders(req),
    'Content-Type': 'application/json'
  };

  // Log every request in detail
  console.log(`${FUNCTION_NAME} received ${req.method} request from ${req.headers.get('origin') || 'unknown origin'}`);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: responseHeaders });
  }
  
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // For this specific test endpoint, we'll allow unauthenticated requests for debugging
    // but we'll include auth status in the response
    
    // Parse request params from either query string (GET) or body (POST)
    let params = {};
    if (req.method === 'POST') {
      try {
        params = await req.json();
      } catch (e) {
        console.log('Failed to parse JSON body:', e);
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      params = Object.fromEntries(url.searchParams);
    }
    
    // Track this event
    await trackEvent({
      event_name: `${FUNCTION_NAME}_request`,
      user_id: user?.id,
      properties: { method: req.method, authenticated: !!user }
    });
    
    // Return response with auth status and request details
    return new Response(JSON.stringify({
      success: true,
      message: 'CORS test successful',
      authenticated: !!user,
      user_id: user?.id,
      method: req.method,
      params: params,
      headers_received: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString()
    }), { headers: responseHeaders });
    
  } catch (error) {
    console.error(`${FUNCTION_NAME} error:`, error);
    
    // Track error
    await trackEvent({
      event_name: `${FUNCTION_NAME}_error`,
      user_id: undefined,
      properties: { error: error.message }
    });
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: responseHeaders
    });
  }
});
