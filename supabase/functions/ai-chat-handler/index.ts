import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

const FUNCTION_NAME = 'ai-chat-handler';

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

async function getChatMessages(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // Verify brief ownership
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('id')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (briefError || !brief) throw new HttpError('Brief not found or access denied', 404);
  
  // Get chat messages
  const { data: messages, error: messagesError } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('brief_id', briefId)
    .order('created_at', { ascending: true });
    
  if (messagesError) throw new HttpError('Failed to fetch chat messages', 500);
  
  return { 
    messages: messages || []
  };
}

async function sendMessage(supabaseAdmin: SupabaseClient, briefId: string, userId: string, content: string) {
  // Verify brief ownership
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('id, title, description, requirements')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (briefError || !brief) throw new HttpError('Brief not found or access denied', 404);
  
  // Save user message
  const userMessageId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const { error: userMessageError } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      id: userMessageId,
      brief_id: briefId,
      user_id: userId,
      type: 'user',
      content: content,
      created_at: timestamp
    });
    
  if (userMessageError) throw new HttpError('Failed to save user message', 500);
  
  // Simulate AI response - In production, this would call an external AI service
  // or use N8n workflow as specified in the architecture
  let aiResponse = '';
  
  // Simple AI response based on message content
  if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
    aiResponse = `Hello! I'm here to help refine your brief about "${brief.title}". What specific aspects would you like to focus on?`;
  } else if (content.toLowerCase().includes('capabilities') || content.toLowerCase().includes('features')) {
    aiResponse = 'Based on your requirements, suppliers should have capabilities like manufacturing, distribution, and quality control. Would you like to prioritize any specific capabilities?';
  } else if (content.toLowerCase().includes('solution') || content.toLowerCase().includes('suggest')) {
    aiResponse = 'I have some solution suggestions for you. Let me analyze your requirements and propose some options.';
    
    // Generate solution suggestions after responding
    await generateSolutions(supabaseAdmin, briefId, userId, brief);
  } else {
    aiResponse = `I've analyzed your message about "${brief.title}". Can you provide more specific details about your requirements to help me better understand your needs?`;
  }
  
  // Save AI response
  const aiMessageId = crypto.randomUUID();
  
  const { error: aiMessageError } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      id: aiMessageId,
      brief_id: briefId,
      user_id: userId,
      type: 'ai',
      content: aiResponse,
      created_at: new Date().toISOString()
    });
    
  if (aiMessageError) throw new HttpError('Failed to save AI message', 500);
  
  // Get updated messages
  return await getChatMessages(supabaseAdmin, briefId, userId);
}

async function generateSolutions(supabaseAdmin: SupabaseClient, briefId: string, userId: string, brief: any) {
  // In production, this would call an external AI service
  // Here we're using placeholder solutions based on the brief content
  
  // Check if we already have solutions for this brief
  const { data: existingSolutions, error: checkError } = await supabaseAdmin
    .from('solutions')
    .select('id')
    .eq('brief_id', briefId)
    .limit(1);
    
  // Only generate solutions if none exist yet
  if (!checkError && existingSolutions && existingSolutions.length === 0) {
    // Mock solution generation based on brief content
    const solutionCount = Math.floor(Math.random() * 2) + 2; // 2-3 solutions
    const solutions = [];
    
    // Extract capabilities from brief requirements
    const capabilities = brief.requirements?.capabilities || ['Manufacturing', 'Distribution', 'Quality Control'];
    
    for (let i = 0; i < solutionCount; i++) {
      // Create random solutions with varying match scores
      const solution = {
        id: crypto.randomUUID(),
        brief_id: briefId,
        name: `Solution ${i+1}`,
        description: `A potential solution for your brief "${brief.title}" focusing on ${capabilities.slice(0, 2).join(' and ')}.`,
        capabilities: capabilities.slice(0, Math.min(capabilities.length, i+2)),
        match_score: Math.floor(Math.random() * 30) + 70, // 70-99 match score
        is_validated: false,
        created_at: new Date().toISOString()
      };
      
      solutions.push(solution);
    }
    
    // Insert solutions
    if (solutions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('solutions')
        .insert(solutions);
        
      if (insertError) {
        console.error('Failed to insert solutions:', insertError);
      }
    }
  }
}

async function getSolutions(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // Verify brief ownership
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('id')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (briefError || !brief) throw new HttpError('Brief not found or access denied', 404);
  
  // Get solutions
  const { data: solutions, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .eq('brief_id', briefId)
    .order('match_score', { ascending: false });
    
  if (solutionsError) throw new HttpError('Failed to fetch solutions', 500);
  
  return { 
    solutions: solutions || []
  };
}

async function validateSolution(supabaseAdmin: SupabaseClient, briefId: string, solutionId: string, userId: string) {
  // Verify brief ownership
  const { data: brief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('id, status')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (briefError || !brief) throw new HttpError('Brief not found or access denied', 404);
  
  // Verify solution exists for this brief
  const { data: solution, error: solutionError } = await supabaseAdmin
    .from('solutions')
    .select('id')
    .eq('id', solutionId)
    .eq('brief_id', briefId)
    .single();
    
  if (solutionError || !solution) throw new HttpError('Solution not found', 404);
  
  // Add to validated solutions
  const validatedSolutionId = crypto.randomUUID();
  
  const { error: validationError } = await supabaseAdmin
    .from('validated_solutions')
    .insert({
      id: validatedSolutionId,
      brief_id: briefId,
      solution_id: solutionId,
      user_id: userId,
      created_at: new Date().toISOString()
    });
    
  if (validationError) throw new HttpError('Failed to validate solution', 500);
  
  // Update solution status
  const { error: updateError } = await supabaseAdmin
    .from('solutions')
    .update({ is_validated: true })
    .eq('id', solutionId);
    
  if (updateError) throw new HttpError('Failed to update solution status', 500);
  
  // Update brief status to active if it's still draft
  if (brief.status === 'draft') {
    const { error: briefUpdateError } = await supabaseAdmin
      .from('briefs')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', briefId);
      
    if (briefUpdateError) throw new HttpError('Failed to update brief status', 500);
  }
  
  // Get updated solutions
  return await getSolutions(supabaseAdmin, briefId, userId);
}

async function checkSearchQuota(supabaseAdmin: SupabaseClient, userId: string) {
  // Get user's quota information
  const { data: userMetadata, error: metadataError } = await supabaseAdmin
    .from('users_metadata')
    .select('fast_searches_used, fast_searches_limit')
    .eq('user_id', userId)
    .single();
    
  if (metadataError) throw new HttpError('Failed to fetch user quota', 500);
  
  // Return quota information
  return {
    used: userMetadata?.fast_searches_used || 0,
    limit: userMetadata?.fast_searches_limit || 3,
    remaining: (userMetadata?.fast_searches_limit || 3) - (userMetadata?.fast_searches_used || 0)
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
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
    let result;
    
    switch (action) {
      case 'get_messages':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await getChatMessages(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'send_message':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        if (!message_content) throw new HttpError('Missing required parameter: message_content', 400);
        result = await sendMessage(supabaseAdmin, brief_id, user.id, message_content);
        break;
        
      case 'get_solutions':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await getSolutions(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'validate_solution':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        if (!solution_id) throw new HttpError('Missing required parameter: solution_id', 400);
        result = await validateSolution(supabaseAdmin, brief_id, solution_id, user.id);
        break;
        
      case 'check_search_quota':
        result = await checkSearchQuota(supabaseAdmin, user.id);
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { brief_id, solution_id });
    
    // 5. Response
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(`Error in ${FUNCTION_NAME}:`, error);
    
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Create supabase admin client for error logging
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system', { error: errorMessage });
    } catch (loggingError) {
      console.error('Failed to log error event:', loggingError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: statusCode,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json'
      }
    });
  }
});
