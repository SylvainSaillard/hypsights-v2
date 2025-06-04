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

function corsResponse(req: Request, data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      'Content-Type': 'application/json'
    }
  });
}

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const N8N_WEBHOOK_URL = 'https://n8n.proxiwave.com/webhook-test/brief-interpretation';
const FUNCTION_NAME = 'ai-chat-handler';

// Debug mode - set to true for local development
const DEBUG_MODE = true;

// Custom HttpError class
class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Create Supabase client
function createSupabaseClient(isAdmin = false): SupabaseClient {
  return createClient(
    SUPABASE_URL,
    isAdmin ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// Authenticate the user from request
async function authenticateUser(req: Request): Promise<User> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      throw new Error('Invalid authentication token');
    }
    
    return user;
  } catch (error) {
    console.error('Authorization failed:', error);
    throw new HttpError('Unauthorized access', 401);
  }
}

// Track analytics events 
async function trackAnalytics(supabase: SupabaseClient, eventName: string, userId: string, metadata: any) {
  try {
    await supabase.from('search_events').insert({
      user_id: userId,
      type: eventName,
      source: 'edge_function',
      metadata,
      launched_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to track analytics:', error);
    // Don't throw - analytics failure shouldn't break the flow
  }
}

// N8N webhook integration
async function callN8nWebhook(briefData: any, isTest = false) {
  console.log(`[${FUNCTION_NAME}] Calling n8n webhook with${isTest ? ' test' : ''} data`);
  
  try {
    // Enhanced logging for debugging
    console.log(`[${FUNCTION_NAME}] Webhook URL: ${N8N_WEBHOOK_URL}`);
    console.log(`[${FUNCTION_NAME}] Request payload:`, JSON.stringify(briefData));
    
    const startTime = Date.now();
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Test-Mode': isTest ? 'true' : 'false'
      },
      body: JSON.stringify(briefData)
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`[${FUNCTION_NAME}] N8N webhook response received in ${responseTime}ms, status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${FUNCTION_NAME}] N8N webhook error:`, errorText);
      return { 
        success: false, 
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries([...response.headers]),
        responseTime
      };
    }
    
    // Try to parse as JSON but handle text response too
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { text: await response.text() };
    }
    
    console.log(`[${FUNCTION_NAME}] N8N webhook response:`, data);
    return { 
      success: true, 
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries([...response.headers]),
      responseTime
    };
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Failed to call N8N webhook:`, error);
    return { 
      success: false, 
      error: String(error),
      errorObject: error,
      timestamp: new Date().toISOString()
    };
  }
}

// Fetch brief data (simplified version)
async function getBriefData(supabaseAdmin: SupabaseClient, briefId: string) {
  console.log(`[${FUNCTION_NAME}] Fetching brief data for:`, briefId);

  try {
    // Direct query to get brief data
    const { data: brief, error } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single();
      
    if (error) {
      console.error(`[${FUNCTION_NAME}] Error fetching brief:`, error);
      return null;
    }
    
    return brief;
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Unexpected error in getBriefData:`, error);
    return null;
  }
}

// Fetch chat messages (simplified version)
async function getChatMessages(supabaseAdmin: SupabaseClient, briefId: string) {
  console.log(`[${FUNCTION_NAME}] Fetching chat messages for brief:`, briefId);
  
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error(`[${FUNCTION_NAME}] Error fetching chat messages:`, error);
      return [];
    }
    
    return messages || [];
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Unexpected error in getChatMessages:`, error);
    return [];
  }
}

// Simplified solution data (temporarily hardcoded to avoid database issues)
function getPlaceholderSolutions() {
  return {
    solutions: [
      {
        id: 'placeholder-1',
        name: 'Solution Available',
        description: 'Click to view solution details and launch search',
        is_validated: false
      }
    ],
    quota: {
      used: 0,
      limit: 3,
      remaining: 3
    }
  };
}

serve(async (req: Request) => {
  // Handle OPTIONS
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
    
    const { action, brief_id, solution_id, message_content } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result = {};
    
    switch (action) {
      case 'test_n8n_webhook': {
        console.log(`[${FUNCTION_NAME}] Testing n8n webhook connection`);
        
        // Create a test payload
        const testPayload = {
          test: true,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          source: 'edge_function_test',
          request_id: crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        };
        
        // Call the webhook with test flag
        const webhookResult = await callN8nWebhook(testPayload, true);
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'test_n8n_webhook', user.id, { 
          success: webhookResult.success,
          status: webhookResult.status
        });
        
        result = webhookResult;
        break;
      }
      
      case 'get_solutions': {
        if (!brief_id) {
          throw new HttpError('Missing required parameter: brief_id', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Getting solutions for brief:`, brief_id);
        
        // Get brief data
        const brief = await getBriefData(supabaseAdmin, brief_id);
        
        // Use placeholder solution data
        result = getPlaceholderSolutions();
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'get_solutions', user.id, { brief_id });
        break;
      }
        
      case 'get_chat_messages': {
        if (!brief_id) {
          throw new HttpError('Missing required parameter: brief_id', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Getting chat messages for brief:`, brief_id);
        
        // Get chat messages using the helper function
        const messages = await getChatMessages(supabaseAdmin, brief_id);
        
        // Get brief data for context
        const brief = await getBriefData(supabaseAdmin, brief_id);
        
        result = { 
          messages,
          brief
        };
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'get_chat_messages', user.id, { 
          brief_id,
          message_count: messages?.length || 0
        });
        break;
      }
      
      case 'send_message': {
        if (!brief_id || !message_content) {
          throw new HttpError('Missing required parameter: brief_id or message_content', 400);
        }
        
        if (typeof message_content !== 'string' || !message_content.trim()) {
          throw new HttpError('Message is required and must be a non-empty string', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Processing send_message for brief_id: ${brief_id}`);
        
        // Get brief data to send to n8n
        const { data: briefData, error: briefError } = await supabaseAdmin
          .from('briefs')
          .select('*')
          .eq('id', brief_id)
          .single();
          
        if (briefError) {
          console.error(`[${FUNCTION_NAME}] Failed to fetch brief data:`, briefError);
          throw new HttpError('Failed to fetch brief data', 500);
        }
        
        // Store user message first
        const { data: userMessageData, error: storeError } = await supabaseAdmin
          .from('chat_messages')
          .insert({
            brief_id,
            user_id: user.id,
            message_text: message_content.trim(),
            is_from_user: true
          })
          .select()
          .single();
          
        if (storeError) {
          console.error(`[${FUNCTION_NAME}] Failed to store user message:`, storeError);
          throw new HttpError('Failed to store message', 500);
        }
        
        // Prepare payload for n8n webhook
        const webhookPayload = {
          brief: briefData,
          user: {
            id: user.id,
            email: user.email
          },
          message: {
            id: userMessageData.id,
            text: message_content.trim(),
            timestamp: new Date().toISOString()
          },
          requestId: crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        };
        
        // Call n8n webhook asynchronously
        console.log(`[${FUNCTION_NAME}] Sending brief data to n8n webhook`);
        const webhookPromise = callN8nWebhook(webhookPayload);
        
        // Store immediate acknowledgement message from AI
        const acknowledgementMessage = "Je vais réfléchir à votre demande... Un instant.";
        
        const { error: aiStoreError } = await supabaseAdmin
          .from('chat_messages')
          .insert({
            brief_id,
            user_id: user.id,
            message_text: acknowledgementMessage,
            is_from_user: false,
            message_type: 'acknowledgement'
          });
          
        if (aiStoreError) {
          console.error(`[${FUNCTION_NAME}] Failed to store AI acknowledgement:`, aiStoreError);
          throw new HttpError('Failed to store AI response', 500);
        }
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'send_message', user.id, { 
          brief_id,
          message_length: message_content.trim().length,
          timestamp: new Date().toISOString()
        });
        
        // Return all chat messages immediately without waiting for n8n response
        const { data: chatMessages, error: fetchError } = await supabaseAdmin
          .from('chat_messages')
          .select('*')
          .eq('brief_id', brief_id)
          .order('created_at', { ascending: true });
          
        if (fetchError) {
          console.error(`[${FUNCTION_NAME}] Failed to fetch chat messages:`, fetchError);
          throw new HttpError('Failed to fetch chat history', 500);
        }
        
        // Handle webhook response in background
        webhookPromise.then(async (webhookResponse) => {
          console.log(`[${FUNCTION_NAME}] Received n8n webhook response:`, webhookResponse);
          
          // n8n will update the database directly with AI response, no need to handle here
          // This is just for logging
          if (!webhookResponse.success) {
            console.error(`[${FUNCTION_NAME}] n8n webhook failed:`, webhookResponse.error);
            
            // Track webhook failure
            await trackAnalytics(supabaseAdmin, 'webhook_failure', user.id, { 
              brief_id,
              error: webhookResponse.error,
              status: webhookResponse.status
            });
          }
        }).catch(error => {
          console.error(`[${FUNCTION_NAME}] Error handling n8n webhook:`, error);
          
          // Track error
          trackAnalytics(supabaseAdmin, 'webhook_error', user.id, { 
            brief_id,
            error: String(error)
          }).catch(e => console.error('Failed to track analytics:', e));
        });
        
        result = { 
          chatMessages,
          processingStatus: 'acknowledged',
          message: 'Message received and processing started'
        };
        break;
      }
      
      case 'validate_solution': {
        if (!brief_id || !solution_id) {
          throw new HttpError('Missing required parameter: brief_id or solution_id', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Validating solution:`, solution_id);
        
        // Just return placeholder data for now
        result = getPlaceholderSolutions();
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'validate_solution', user.id, { 
          brief_id,
          solution_id
        });
        break;
      }
      
      default:
        throw new HttpError(`Unknown action: ${action}`, 400);
    }
    
    // 4. Return success response with CORS headers
    return corsResponse(req, { success: true, data: result });
    
  } catch (error) {
    // Log error
    console.error(`[${FUNCTION_NAME}] Error:`, error);
    
    // Create error response
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : 'Internal server error';
    
    // Return error response with CORS headers
    return corsResponse(req, { success: false, error: message }, status);
  }
});
