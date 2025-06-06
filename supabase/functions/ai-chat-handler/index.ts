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

// Fonction pour envoyer un message
async function sendMessage(supabaseAdmin: SupabaseClient, briefId: string, userId: string, messageContent: string) {
  console.log(`[${FUNCTION_NAME}] Storing user message for brief ${briefId}`);
  
  try {
    // 1. Stocker le message de l'utilisateur
    const { data: userMessageData, error: storeError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        brief_id: briefId,
        user_id: userId,
        content: messageContent.trim(),
        is_ai: false
      })
      .select()
      .single();
      
    if (storeError) {
      console.error(`[${FUNCTION_NAME}] Failed to store user message:`, storeError);
      throw new HttpError('Failed to store message', 500);
    }
    
    // 2. Préparer les données pour le webhook n8n
    const { data: briefData, error: briefError } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single();
      
    if (briefError) {
      console.error(`[${FUNCTION_NAME}] Failed to fetch brief data:`, briefError);
      throw new HttpError('Failed to fetch brief data', 500);
    }
    
    // 3. Préparer le payload pour n8n
    const webhookPayload = {
      brief: briefData,
      user: {
        id: userId
      },
      message: {
        id: userMessageData.id,
        content: messageContent.trim(),
        timestamp: new Date().toISOString()
      },
      requestId: crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
    };
    
    // 4. Envoyer les données au webhook n8n en arrière-plan
    console.log(`[${FUNCTION_NAME}] Sending brief data to n8n webhook`);
    const webhookPromise = callN8nWebhook(webhookPayload);
    
    // 5. Stocker un message d'accusé de réception immédiat
    const acknowledgementMessage = "Je vais réfléchir à votre demande... Un instant.";
    
    const { error: aiStoreError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        brief_id: briefId,
        user_id: userId,
        content: acknowledgementMessage,
        is_ai: true,
        metadata: { type: 'acknowledgement' }
      });
      
    if (aiStoreError) {
      console.error(`[${FUNCTION_NAME}] Failed to store AI acknowledgement:`, aiStoreError);
      throw new HttpError('Failed to store AI response', 500);
    }
    
    // 6. Récupérer tous les messages mis à jour
    const { data: chatMessages, error: fetchError } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('brief_id', briefId)
      .order('created_at', { ascending: true });
      
    if (fetchError) {
      console.error(`[${FUNCTION_NAME}] Failed to fetch chat messages:`, fetchError);
      throw new HttpError('Failed to fetch chat history', 500);
    }
    
    // 7. Gérer la réponse du webhook en arrière-plan (sans bloquer)
    webhookPromise.catch(error => {
      console.error(`[${FUNCTION_NAME}] Error handling n8n webhook:`, error);
      
      // Track error
      trackAnalytics(supabaseAdmin, 'webhook_error', userId, { 
        brief_id: briefId,
        error: String(error)
      }).catch(e => console.error('Failed to track analytics:', e));
    });
    
    return {
      chatMessages,
      processingStatus: 'acknowledged',
      message: 'Message received and processing started'
    };
    
  } catch (error) {
    console.error(`[${FUNCTION_NAME}] Error in sendMessage:`, error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    // 1. Authenticate user
    const user = await authenticateUser(req);
    
    // 2. Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      throw new HttpError('Invalid request body', 400);
    }
    
    const { action, brief_id, message_content, solution_id } = requestBody;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    console.log(`[${FUNCTION_NAME}] Processing action: ${action}`);
    
    // 3. Create admin Supabase client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 4. Process action
    let result;
    
    switch (action) {
      case 'get_chat_messages': {
        if (!brief_id) {
          throw new HttpError('Missing required parameter: brief_id', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Fetching chat messages for brief:`, brief_id);
        
        result = await getChatMessages(supabaseAdmin, brief_id);
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'get_chat_messages', user.id, { brief_id });
        break;
      }
      
      case 'send_message': {
        if (!brief_id || !message_content) {
          throw new HttpError('Missing required parameters: brief_id or message_content', 400);
        }
        
        if (typeof message_content !== 'string' || !message_content.trim()) {
          throw new HttpError('Message is required and must be a non-empty string', 400);
        }
        
        console.log(`[${FUNCTION_NAME}] Processing message for brief:`, brief_id);
        
        result = await sendMessage(supabaseAdmin, brief_id, user.id, message_content);
        
        // Track analytics
        await trackAnalytics(supabaseAdmin, 'send_message', user.id, { 
          brief_id,
          message_length: message_content.trim().length,
          timestamp: new Date().toISOString()
        });
        break;
      }
      
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
    
    // 5. Return success response with CORS headers
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
