import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const FUNCTION_NAME = 'i18n-handler';

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

// Form options translations as fallback if database doesn't have them
function getFormOptionsTranslations(locale: string) {
  const formOptions = {
    en: {
      // Maturity options
      maturity: {
        commercial: 'Commercial',
        commercial_ots: 'Commercial / Off-the-shelf to adapt',
        proof_concept: 'Proof of Concept (Feasibility)',
        prototype: 'Prototype',
        research: 'Research'
      },
      // Capabilities options
      capabilities: {
        consulting: 'Consulting or expertise',
        manufacturing: 'Manufacturing capabilities',
        new_technology: 'New Technology',
        outsourced: 'Outsourced capability',
        process: 'Process',
        product: 'Product',
        prototyping: 'Prototyping capabilities',
        supplier: 'Supplier'
      },
      // Organization types
      organization_types: {
        consulting: 'Consulting',
        cro: 'CRO',
        encyclopedia: 'Encyclopedia',
        large_company: 'Large Company',
        marketplace: 'Marketplace',
        not_specified: 'Not Specified',
        research_institute: 'Research Institute or Laboratory',
        small_business: 'Small Business'
      },
      // Geographies
      geographies: {
        anywhere: 'Anywhere',
        asia_pacific: 'Asia-Pacific',
        europe: 'Europe',
        latin_america: 'Latin America',
        middle_east_africa: 'Middle East and Africa',
        north_america: 'North America'
      }
    },
    fr: {
      // Maturity options
      maturity: {
        commercial: 'Commercial',
        commercial_ots: 'Commercial / Prêt à adapter',
        proof_concept: 'Preuve de Concept (Faisabilité)',
        prototype: 'Prototype',
        research: 'Recherche'
      },
      // Capabilities options
      capabilities: {
        consulting: 'Conseil ou expertise',
        manufacturing: 'Capacités de fabrication',
        new_technology: 'Nouvelle Technologie',
        outsourced: 'Capacité externalisée',
        process: 'Processus',
        product: 'Produit',
        prototyping: 'Capacités de prototypage',
        supplier: 'Fournisseur'
      },
      // Organization types
      organization_types: {
        consulting: 'Conseil',
        cro: 'CRO',
        encyclopedia: 'Encyclopédie',
        large_company: 'Grande Entreprise',
        marketplace: 'Place de marché',
        not_specified: 'Non spécifié',
        research_institute: 'Institut de Recherche ou Laboratoire',
        small_business: 'Petite Entreprise'
      },
      // Geographies
      geographies: {
        anywhere: 'N\'importe où',
        asia_pacific: 'Asie-Pacifique',
        europe: 'Europe',
        latin_america: 'Amérique latine',
        middle_east_africa: 'Moyen-Orient et Afrique',
        north_america: 'Amérique du Nord'
      }
    }
  };
  
  return formOptions[locale] || formOptions['en']; // Fallback to English
}

async function getLanguages(supabaseAdmin: SupabaseClient) {
  // Get available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
  
  return { languages };
}

async function getUserLocale(supabaseAdmin: SupabaseClient, userId: string) {
  // Get user's preferred locale from users_metadata
  const { data, error } = await supabaseAdmin
    .from('users_metadata')
    .select('preferred_locale')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Failed to get user locale:', error);
    return { locale: 'en' }; // Default to English
  }
  
  return { locale: data.preferred_locale || 'en' };
}

async function setUserLocale(supabaseAdmin: SupabaseClient, userId: string, locale: string) {
  // Update user's preferred locale in users_metadata
  const { error } = await supabaseAdmin
    .from('users_metadata')
    .update({ preferred_locale: locale })
    .eq('user_id', userId);
    
  if (error) throw new HttpError('Failed to update user locale', 500);
  
  return { success: true, locale };
}

async function getTranslations(supabaseAdmin: SupabaseClient, locale: string, group?: string) {
  // Get translations for specified locale
  let query = supabaseAdmin
    .from('translations')
    .select('key, value')
    .eq('locale', locale);
    
  // Filter by group if specified
  if (group) {
    query = query.eq('group', group);
  }
  
  const { data, error } = await query;
  if (error) throw new HttpError('Failed to fetch translations', 500);
  
  // Convert translations array to object
  const translations = {};
  for (const row of data || []) {
    translations[row.key] = row.value;
  }
  
  // If this is for form options and we don't have translations, return the hardcoded defaults
  if (group === 'form_options' && Object.keys(translations).length === 0) {
    return { translations: getFormOptionsTranslations(locale) };
  }
  
  return { translations };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    
    const { action, locale } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    // Create supabase admin client for database operations
    const supabaseAdmin = createSupabaseClient(true);
    
    // 3. Business logic based on action
    let result;
    
    switch (action) {
      case 'get_languages':
        result = await getLanguages(supabaseAdmin);
        break;
        
      case 'get_user_locale':
        result = await getUserLocale(supabaseAdmin, user.id);
        break;
        
      case 'set_user_locale':
        if (!locale) throw new HttpError('Missing required parameter: locale', 400);
        result = await setUserLocale(supabaseAdmin, user.id, locale);
        break;
        
      case 'get_translations':
        const userLocale = locale || (await getUserLocale(supabaseAdmin, user.id)).locale;
        const group = requestBody.group;
        result = await getTranslations(supabaseAdmin, userLocale, group);
        break;
        
      case 'get_form_options':
        const formOptionsLocale = locale || (await getUserLocale(supabaseAdmin, user.id)).locale;
        result = { formOptions: getFormOptionsTranslations(formOptionsLocale) };
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // 4. Analytics tracking
    await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { locale });
    
    // 5. Response
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: {
        ...corsHeaders,
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
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
