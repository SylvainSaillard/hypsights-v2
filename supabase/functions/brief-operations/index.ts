import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS Template v1.0 (2025-06-04) - Standardized implementation
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

const FUNCTION_NAME = 'brief-operations';

// Request deduplication cache with expiration
// This helps prevent duplicate submissions (especially during development)
const requestCache = new Map<string, Response>();

// Clean up old cache entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    // Remove entries older than 2 minutes
    if ((value as any).timestamp && now - (value as any).timestamp > 120000) {
      requestCache.delete(key);
      console.log(`Removed expired request cache entry: ${key}`);
    }
  }
}, 300000);  // 5 minutes

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

async function listBriefs(supabaseAdmin: SupabaseClient, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new HttpError('Failed to fetch briefs', 500);
  
  return { briefs: data || [] };
}

async function getBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  console.log(`Fetching brief ${briefId} for user ${userId}`);
  
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .select(`
      *,
      solutions:solutions(*, suppliers:suppliers(*))
    `)
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching brief:', error);
    throw new HttpError('Brief not found', 404);
  }

  const solutions = data.solutions || [];
  const fastSearchesUsed = solutions.filter(s => s.fast_search_launched_at).length;
  
  // Format array fields for frontend display, now including solutions
  const formattedBrief = {
    ...data,
    reference_companies: data.reference_companies || [],
    maturity: data.maturity || [],
    geographies: data.geographies || [],
    organization_types: data.organization_types || [],
    capabilities: data.capabilities || [],
    solutions: solutions, // Ensure solutions is always an array
    fast_searches_used: fastSearchesUsed
  };
  
  console.log('Formatted brief data:', JSON.stringify(formattedBrief, null, 2));
  
  return { brief: formattedBrief };
}

async function createBrief(supabaseAdmin: SupabaseClient, briefData: any, userId: string) {
  // Generate a UUID for the new brief
  const briefId = crypto.randomUUID();
  
  console.log('Creating brief with data:', JSON.stringify(briefData, null, 2));
  
  // Normalisation : si briefData est déjà structuré ou s'il contient brief_data
  const sourceData = briefData.brief_data || briefData;
  
  console.log('Source data structure:', JSON.stringify(sourceData, null, 2));
  
  // Extract all fields to store as columns
  const { 
    title, 
    description,
    reference_companies = [],
    maturity = [],
    geographies = [],
    organization_types = [],
    capabilities = [],
    locale = 'en', // Default locale si non spécifié
    translations
  } = sourceData;
  
  // Prepare the brief record with individual columns (plus de JSONB requirements)
  const briefRecord = {
    id: briefId,
    user_id: userId,
    title: title || 'Untitled Brief',
    description: description || '',
    reference_companies,
    maturity,
    geographies,
    organization_types,
    capabilities,
    default_locale: locale,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Inserting brief record:', JSON.stringify(briefRecord, null, 2));
  
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .insert(briefRecord)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating brief:', error);
    throw new HttpError(`Failed to create brief: ${error.message}`, 500);
  }
  
  // Gestion du multilinguisme via la table translations si des traductions sont fournies
  if (briefData.translations) {
    const translationsToAdd = [];
    
    // Pour chaque langue supportée
    for (const lang in briefData.translations) {
      if (lang === locale) continue; // Skip la langue par défaut
      
      const transData = briefData.translations[lang];
      
      // Pour chaque champ traduisible
      for (const field of ['title', 'description']) {
        if (transData[field]) {
          translationsToAdd.push({
            key: `brief:${briefId}:${field}`,
            locale: lang,
            value: transData[field],
            context: 'brief.' + field
          });
        }
      }
    }
    
    // Ajouter les traductions à la table translations
    if (translationsToAdd.length > 0) {
      const { error: transError } = await supabaseAdmin
        .from('translations')
        .insert(translationsToAdd);
        
      if (transError) {
        console.error('Error adding translations:', transError);
        // On ne lance pas d'erreur pour ne pas bloquer la création du brief
      }
    }
  }
  
  // Créer automatiquement le premier message de chat
  try {
    console.log('Creating initial chat message for brief:', briefId);
    
    // Créer un message initial basé sur la description du brief
    const initialMessage = description 
      ? `Bonjour ! J'ai analysé votre brief "${title}". Voici ce que j'ai compris : ${description.substring(0, 150)}${description.length > 150 ? '...' : ''} Comment puis-je vous aider à trouver les meilleurs fournisseurs pour votre projet ?`
      : `Bonjour ! Votre brief "${title}" a été créé. Comment puis-je vous aider à trouver les meilleurs fournisseurs pour votre projet ?`;
    
    // Insérer le message utilisateur dans la table chat_messages
    await supabaseAdmin.from('chat_messages').insert({
      id: crypto.randomUUID(),
      brief_id: briefId,
      user_id: userId,
      role: 'user',
      content: initialMessage,
      created_at: new Date().toISOString()
    });
    
    // Insérer un message d'accusé de réception de l'IA
    await supabaseAdmin.from('chat_messages').insert({
      id: crypto.randomUUID(),
      brief_id: briefId,
      role: 'assistant',
      content: "Je réfléchis à votre demande...",
      created_at: new Date().toISOString()
    });
    
    // Préparer les données pour le webhook N8N
    const webhookPayload = {
      brief_id: briefId,
      user_id: userId,
      message: initialMessage,
      brief: {
        title,
        description,
        reference_companies,
        maturity,
        geographies,
        organization_types,
        capabilities
      },
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID()
    };
    
    // Appeler le webhook N8N de manière synchrone pour l'initialisation du brief
    console.log('Calling N8N webhook for brief initialization...');
    try {
      const webhookResponse = await fetch('https://n8n-hypsights.proxiwave.app/webhook/brief_initialisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('N8N webhook error:', errorText);
        // Ne pas bloquer la création du brief si l'appel webhook échoue
      } else {
        console.log('N8N webhook completed successfully');
      }
    } catch (webhookError) {
      console.error('Error calling N8N webhook:', webhookError);
      // Ne pas bloquer la création du brief si l'appel webhook échoue
    }
    
    console.log('Initial chat message created successfully');
  } catch (chatError) {
    console.error('Error creating initial chat message:', chatError);
    // Ne pas bloquer la création du brief si la création du message échoue
  }
  
  return { brief: data };
}

async function updateBrief(supabaseAdmin: SupabaseClient, briefId: string, briefData: any, userId: string) {
  // First, check if the brief exists and belongs to the user
  const { data: existingBrief, error: checkError } = await supabaseAdmin
    .from('briefs')
    .select('id, default_locale')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (checkError || !existingBrief) throw new HttpError('Brief not found', 404);
  
  // Extract all fields from brief_data to store as columns
  const { 
    title, 
    description,
    reference_companies,
    maturity,
    geographies,
    organization_types,
    capabilities,
    locale = existingBrief.default_locale || 'en',
    translations
  } = briefData.brief_data || {};
  
  // Prepare the update record with individual columns
  const updateRecord: Record<string, any> = {
    updated_at: new Date().toISOString()
  };
  
  // Ajouter seulement les champs qui sont présents
  if (title !== undefined) updateRecord.title = title;
  if (description !== undefined) updateRecord.description = description;
  if (reference_companies !== undefined) updateRecord.reference_companies = reference_companies;
  if (maturity !== undefined) updateRecord.maturity = maturity;
  if (geographies !== undefined) updateRecord.geographies = geographies;
  if (organization_types !== undefined) updateRecord.organization_types = organization_types;
  if (capabilities !== undefined) updateRecord.capabilities = capabilities;
  if (locale !== undefined) updateRecord.default_locale = locale;
  
  console.log('Updating brief with data:', JSON.stringify(updateRecord, null, 2));
  
  // Update the brief
  const { data, error } = await supabaseAdmin
    .from('briefs')
    .update(updateRecord)
    .eq('id', briefId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating brief:', error);
    throw new HttpError(`Failed to update brief: ${error.message}`, 500);
  }
  
  // Gestion du multilinguisme via la table translations si des traductions sont fournies
  if (translations) {
    const translationsToAdd = [];
    
    // Pour chaque langue supportée
    for (const lang in translations) {
      if (lang === locale) continue; // Skip la langue par défaut
      
      const transData = translations[lang];
      
      // Pour chaque champ traduisible
      for (const field of ['title', 'description']) {
        if (transData[field]) {
          translationsToAdd.push({
            key: `brief:${briefId}:${field}`,
            locale: lang,
            value: transData[field],
            context: 'brief.' + field
          });
        }
      }
    }
    
    // Ajouter ou mettre à jour les traductions
    if (translationsToAdd.length > 0) {
      const { error: transError } = await supabaseAdmin
        .from('translations')
        .upsert(translationsToAdd, { onConflict: 'key,locale' });
        
      if (transError) {
        console.error('Error updating translations:', transError);
        // On ne lance pas d'erreur pour ne pas bloquer la mise à jour du brief
      }
    }
  }
  
  return { brief: data };
}

async function deleteBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // First, check if the brief exists and belongs to the user
  const { data: existingBrief, error: checkError } = await supabaseAdmin
    .from('briefs')
    .select('id')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (checkError || !existingBrief) throw new HttpError('Brief not found', 404);
  
  // Delete the brief
  const { error } = await supabaseAdmin
    .from('briefs')
    .delete()
    .eq('id', briefId);
    
  if (error) throw new HttpError('Failed to delete brief', 500);
  
  return { success: true };
}

async function duplicateBrief(supabaseAdmin: SupabaseClient, briefId: string, userId: string) {
  // Vérifier que le brief existe et appartient à l'utilisateur
  const { data: existingBrief, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('user_id', userId)
    .single();
    
  if (briefError || !existingBrief) {
    throw new HttpError(`Brief not found or access denied: ${briefError?.message || 'Unknown error'}`, 404);
  }
  
  // Générer un nouvel ID pour le brief dupliqué
  const newBriefId = crypto.randomUUID();
  
  // Créer une copie du brief avec un nouveau titre
  const duplicatedBrief = {
    ...existingBrief,
    id: newBriefId,
    title: `${existingBrief.title} (Copy)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Insérer le brief dupliqué
  const { error: insertError } = await supabaseAdmin
    .from('briefs')
    .insert(duplicatedBrief);
    
  if (insertError) {
    throw new HttpError(`Failed to duplicate brief: ${insertError.message}`, 500);
  }
  
  return { brief: { ...duplicatedBrief } };
}


serve(async (req) => {
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
    
    const { action, brief_id, request_id, ...params } = requestBody as any;
    
    // Check for duplicate requests using request_id from body only
    if (action === 'create_brief' && request_id) {
      if (requestCache.has(request_id)) {
        console.log(`Duplicate request detected: ${request_id}`);
        return requestCache.get(request_id) as Response;
      }
    }
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result;
    
    switch (action) {
      case 'list_briefs':
        result = await listBriefs(supabaseAdmin, user.id);
        break;
        
      case 'get_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await getBrief(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'create_brief':
        result = await createBrief(supabaseAdmin, params, user.id);
        break;
        
      case 'update_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await updateBrief(supabaseAdmin, brief_id, params, user.id);
        break;
        
      case 'delete_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await deleteBrief(supabaseAdmin, brief_id, user.id);
        break;
        
      case 'duplicate_brief':
        if (!brief_id) throw new HttpError('Missing required parameter: brief_id', 400);
        result = await duplicateBrief(supabaseAdmin, brief_id, user.id);
        break;
        

      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }

    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { brief_id, ...params });

    // 5. Response
    // Create a properly structured response for the frontend
    // Standardize response structure for all actions
    let responseBody: any = {
      success: true,
      data: result
    };
    
    // For list_briefs action, ensure briefs are available at the expected path
    if (action === 'list_briefs') {
      responseBody = {
        success: true,
        briefs: result.briefs,
        data: {
          briefs: result.briefs
        }
      };
    }
    // For other actions, make sure brief data is accessible at multiple paths for compatibility
    else if (result?.brief) {
      responseBody = {
        success: true,
        data: {
          brief: result.brief,
          brief_id: result.brief.id
        },
        brief: result.brief,
        brief_id: result.brief.id
      };
    }

    // Log the response structure to help with debugging
    console.log('Response structure:', JSON.stringify(responseBody, null, 2));

    const responseFinal = corsResponse(responseBody, req);

    // Cache the response for duplicate request detection (using body request_id only)
    if ((action === 'create_brief' || action === 'update_brief') && request_id) {
      // Add timestamp to allow cache cleanup
      const cachedResponse = responseFinal.clone();
      (cachedResponse as any).timestamp = Date.now();
      requestCache.set(request_id, cachedResponse);
      console.log(`Cached response for request ID: ${request_id}`);
      
      // Auto-cleanup this specific request after 2 minutes
      setTimeout(() => {
        requestCache.delete(request_id);
      }, 120000); // 2 minutes
    }
    
    return responseFinal;
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
    
    return corsResponse({ success: false, error: errorMessage }, req, { status: statusCode });
  }
});
