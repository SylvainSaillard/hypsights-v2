import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';

const FUNCTION_NAME = 'i18n-handler';

// Define the allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531', // Additional local development port
  'https://hypsights-v2.vercel.app',
  'https://hypsights.com'
];

// Define the base CORS headers structure
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

// Function to get allowed origin based on the request
function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  
  // Return the origin if it's in the allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Default to the production URL
  return 'https://hypsights-v2.netlify.app';
}

// Function to get production-optimized CORS headers based on the request
function getCorsHeaders(req: Request) {
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': getAllowedOrigin(req)
  };
}

// Helper function to handle OPTIONS preflight requests
function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }
  return null;
}

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

async function getTranslations(locale: string = 'en') {
  try {
    const supabaseAdmin = createSupabaseClient(true);
    const { data: translations, error } = await supabaseAdmin
      .from('translations')
      .select('key, value')
      .eq('locale', locale);

    if (error) throw new Error(`Failed to get translations: ${error.message}`);

    // Convert to key-value object
    const translationsMap = translations?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>) || {};

    return translationsMap;
  } catch (error) {
    console.error('Error getting translations:', error);
    return {}; // Return empty object as fallback
  }
}

async function getFormOptions(locale: string = 'en') {
  try {
    // Get form options from translations
    const supabaseAdmin = createSupabaseClient(true);
    const { data: options, error } = await supabaseAdmin
      .from('translations')
      .select('key, value')
      .eq('locale', locale)
      .or('key.like.geography.%,key.like.org_type.%,key.like.capability.%');

    if (error) {
      console.log('Database error, using fallback options:', error);
      return getFallbackFormOptions(locale);
    }

    // Group options by category
    const formOptions = {
      geographies: [],
      organization_types: [],
      capabilities: []
    };

    options?.forEach(option => {
      const [category, key] = option.key.split('.');
      
      switch (category) {
        case 'geography':
          formOptions.geographies.push({ key, label: option.value });
          break;
        case 'org_type':
          formOptions.organization_types.push({ key, label: option.value });
          break;
        case 'capability':
          formOptions.capabilities.push({ key, label: option.value });
          break;
      }
    });

    return formOptions;
  } catch (error) {
    console.error('Error getting form options:', error);
    return getFallbackFormOptions(locale);
  }
}

function getFallbackFormOptions(locale: string) {
  // Fallback with default options if translations fail
  return {
    geographies: [
      { key: 'europe', label: locale === 'fr' ? 'Europe' : 'Europe' },
      { key: 'north_america', label: locale === 'fr' ? 'Amérique du Nord' : 'North America' },
      { key: 'asia', label: locale === 'fr' ? 'Asie' : 'Asia' },
      { key: 'africa', label: locale === 'fr' ? 'Afrique' : 'Africa' }
    ],
    organization_types: [
      { key: 'startup', label: locale === 'fr' ? 'Startup' : 'Startup' },
      { key: 'sme', label: locale === 'fr' ? 'PME' : 'SME' },
      { key: 'enterprise', label: locale === 'fr' ? 'Grande Entreprise' : 'Enterprise' }
    ],
    capabilities: [
      { key: 'software', label: locale === 'fr' ? 'Développement Logiciel' : 'Software Development' },
      { key: 'hardware', label: locale === 'fr' ? 'Fabrication Matériel' : 'Hardware Manufacturing' },
      { key: 'consulting', label: locale === 'fr' ? 'Services de Conseil' : 'Consulting Services' }
    ]
  };
}

async function getLanguages() {
  // Get available languages
  return [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
}

async function getUserLocale(userId: string) {
  try {
    const supabaseAdmin = createSupabaseClient(true);
    // Get user's preferred locale from users_metadata
    const { data, error } = await supabaseAdmin
      .from('users_metadata')
      .select('preferred_locale')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Failed to get user locale:', error);
      return 'en'; // Default to English
    }
    
    return data?.preferred_locale || 'en';
  } catch (error) {
    console.error('Error getting user locale:', error);
    return 'en'; // Default to English on error
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const preflightResponse = handleOptions(req);
  if (preflightResponse) return preflightResponse;
  
  // Get the CORS headers for this request
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  try {
    // Parse request body
    let requestBody = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch (error) {
      throw new HttpError('Invalid request body', 400);
    }
    
    const { action, locale = 'en' } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Business logic based on action
    let result;
    let userId = 'anonymous';
    
    // Try to authenticate for user-specific actions
    // But don't require auth for basic translations
    try {
      const user = await authenticateUser(req);
      userId = user.id;
    } catch (authError) {
      // For actions requiring authentication, fail
      if (action === 'set_user_locale') {
        throw new HttpError('Authentication required for this action', 401);
      }
      // For other actions, continue anonymously
      console.log('Anonymous request for translations');
    }
    
    switch (action) {
      case 'get_languages':
        result = {
          languages: await getLanguages()
        };
        break;
        
      case 'get_user_locale':
        result = {
          locale: await getUserLocale(userId)
        };
        break;
        
      case 'get_translations':
        result = {
          locale,
          translations: await getTranslations(locale)
        };
        break;
        
      case 'get_form_options':
        result = {
          formOptions: await getFormOptions(locale)
        };
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // Analytics tracking
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, userId, { locale });
    } catch (trackError) {
      console.error('Failed to track event:', trackError);
    }
    
    // Response
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: {
        ...dynamicCorsHeaders,
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
        ...dynamicCorsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
