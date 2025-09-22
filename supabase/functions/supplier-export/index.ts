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

const FUNCTION_NAME = 'supplier-export';

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

interface ExportRow {
  // Supplier information
  supplier_id: string;
  supplier_name: string;
  supplier_description: string;
  supplier_overview: string;
  supplier_country: string;
  supplier_region: string;
  supplier_company_size: string;
  supplier_company_type: string;
  supplier_website: string;
  supplier_maturity: string;
  
  // Scores
  overall_match_score: number;
  solution_fit_score: number;
  brief_fit_score: number;
  geography_score: number;
  company_size_score: number;
  maturity_score: number;
  organization_score: number;
  
  // Solution information
  solution_id: string;
  solution_title: string;
  solution_number: number;
  
  // Product information (one row per product)
  product_id: string;
  product_name: string;
  product_description: string;
  product_url: string;
  product_features: string; // JSON stringified
  product_price_range: string; // JSON stringified
}

async function getSupplierExportData(briefId: string): Promise<ExportRow[]> {
  const supabaseAdmin = createSupabaseClient(true);
  
  // Get all supplier matches for this brief with their products
  const { data, error } = await supabaseAdmin
    .from('supplier_match_profiles')
    .select(`
      id,
      overall_match_score,
      solution_fit_score,
      brief_fit_score,
      geography_score,
      company_size_score,
      maturity_score,
      organization_score,
      match_explanation,
      suppliers!inner (
        id,
        name,
        description,
        company_overview,
        country,
        region,
        company_size,
        company_type,
        website,
        maturity
      ),
      solutions!inner (
        id,
        title,
        solution_number
      ),
      products!inner (
        id,
        name,
        product_description,
        url,
        features,
        price_range
      )
    `)
    .eq('brief_id', briefId)
    .order('overall_match_score', { ascending: false });

  if (error) {
    console.error('Error fetching supplier export data:', error);
    throw new HttpError(`Failed to fetch supplier data: ${error.message}`, 500);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform data into export format - one row per product
  const exportRows: ExportRow[] = [];
  
  for (const match of data) {
    const supplier = match.suppliers;
    const solution = match.solutions;
    const products = match.products || [];
    
    // If no products, create one row with empty product data
    if (products.length === 0) {
      exportRows.push({
        // Supplier info
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_description: supplier.description || '',
        supplier_overview: supplier.company_overview || supplier.description || '',
        supplier_country: supplier.country || 'N/A',
        supplier_region: supplier.region || getRegionFromCountry(supplier.country),
        supplier_company_size: supplier.company_size || 'N/A',
        supplier_company_type: supplier.company_type || 'N/A',
        supplier_website: supplier.website || '',
        supplier_maturity: supplier.maturity || 'N/A',
        
        // Scores
        overall_match_score: match.overall_match_score || 0,
        solution_fit_score: match.solution_fit_score || 0,
        brief_fit_score: match.brief_fit_score || 0,
        geography_score: match.geography_score || 0,
        company_size_score: match.company_size_score || 0,
        maturity_score: match.maturity_score || 0,
        organization_score: match.organization_score || 0,
        
        // Solution info
        solution_id: solution.id,
        solution_title: solution.title,
        solution_number: solution.solution_number || 0,
        
        // Empty product info
        product_id: '',
        product_name: '',
        product_description: '',
        product_url: '',
        product_features: '',
        product_price_range: ''
      });
    } else {
      // Create one row per product
      for (const product of products) {
        exportRows.push({
          // Supplier info (repeated for each product)
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          supplier_description: supplier.description || '',
          supplier_overview: supplier.company_overview || supplier.description || '',
          supplier_country: supplier.country || 'N/A',
          supplier_region: supplier.region || getRegionFromCountry(supplier.country),
          supplier_company_size: supplier.company_size || 'N/A',
          supplier_company_type: supplier.company_type || 'N/A',
          supplier_website: supplier.website || '',
          supplier_maturity: supplier.maturity || 'N/A',
          
          // Scores (repeated for each product)
          overall_match_score: match.overall_match_score || 0,
          solution_fit_score: match.solution_fit_score || 0,
          brief_fit_score: match.brief_fit_score || 0,
          geography_score: match.geography_score || 0,
          company_size_score: match.company_size_score || 0,
          maturity_score: match.maturity_score || 0,
          organization_score: match.organization_score || 0,
          
          // Solution info (repeated for each product)
          solution_id: solution.id,
          solution_title: solution.title,
          solution_number: solution.solution_number || 0,
          
          // Product info (unique per row)
          product_id: product.id,
          product_name: product.name,
          product_description: product.product_description || '',
          product_url: product.url || '',
          product_features: JSON.stringify(product.features || {}),
          product_price_range: JSON.stringify(product.price_range || {})
        });
      }
    }
  }
  
  return exportRows;
}

function getRegionFromCountry(country?: string): string {
  if (!country) return 'N/A';
  
  const countryLower = country.toLowerCase();
  
  if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('canada')) {
    return 'North America';
  }
  if (countryLower.includes('france') || countryLower.includes('germany') || countryLower.includes('uk') || 
      countryLower.includes('spain') || countryLower.includes('italy') || countryLower.includes('europe')) {
    return 'Europe';
  }
  if (countryLower.includes('china') || countryLower.includes('japan') || countryLower.includes('korea') || 
      countryLower.includes('singapore') || countryLower.includes('asia')) {
    return 'Asia';
  }
  
  return 'Other';
}

function convertToCSV(data: ExportRow[]): string {
  if (data.length === 0) {
    return 'No data available';
  }
  
  // Headers
  const headers = [
    'Supplier ID',
    'Supplier Name',
    'Supplier Description',
    'Supplier Overview',
    'Country',
    'Region',
    'Company Size',
    'Company Type',
    'Website',
    'Maturity',
    'Overall Match Score',
    'Solution Fit Score',
    'Brief Fit Score',
    'Geography Score',
    'Company Size Score',
    'Maturity Score',
    'Organization Score',
    'Solution ID',
    'Solution Title',
    'Solution Number',
    'Product ID',
    'Product Name',
    'Product Description',
    'Product URL',
    'Product Features',
    'Product Price Range'
  ];
  
  // Convert data to CSV rows
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const csvRow = [
      escapeCSV(row.supplier_id),
      escapeCSV(row.supplier_name),
      escapeCSV(row.supplier_description),
      escapeCSV(row.supplier_overview),
      escapeCSV(row.supplier_country),
      escapeCSV(row.supplier_region),
      escapeCSV(row.supplier_company_size),
      escapeCSV(row.supplier_company_type),
      escapeCSV(row.supplier_website),
      escapeCSV(row.supplier_maturity),
      row.overall_match_score.toString(),
      row.solution_fit_score.toString(),
      row.brief_fit_score.toString(),
      row.geography_score.toString(),
      row.company_size_score.toString(),
      row.maturity_score.toString(),
      row.organization_score.toString(),
      escapeCSV(row.solution_id),
      escapeCSV(row.solution_title),
      row.solution_number.toString(),
      escapeCSV(row.product_id),
      escapeCSV(row.product_name),
      escapeCSV(row.product_description),
      escapeCSV(row.product_url),
      escapeCSV(row.product_features),
      escapeCSV(row.product_price_range)
    ];
    csvRows.push(csvRow.join(','));
  }
  
  return csvRows.join('\n');
}

function escapeCSV(value: string): string {
  if (!value) return '';
  
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

serve(async (req) => {
  console.log(`${FUNCTION_NAME} received ${req.method} request from ${req.headers.get('origin') || 'unknown'}`);  
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    // Authentication
    const user = await authenticateUser(req);
    
    // Parse request body
    let requestBody = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch (error) {
      throw new HttpError('Invalid request body', 400);
    }
    
    const { action, brief_id, format = 'csv' } = requestBody as any;
    
    if (!action) {
      throw new HttpError('Missing required parameter: action', 400);
    }
    
    if (!brief_id) {
      throw new HttpError('Missing required parameter: brief_id', 400);
    }
    
    // Business logic based on action
    let result;
    
    switch (action) {
      case 'export_suppliers':
        const exportData = await getSupplierExportData(brief_id);
        
        if (format === 'csv') {
          const csvContent = convertToCSV(exportData);
          
          // Track the export event
          const supabaseAdmin = createSupabaseClient(true);
          await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_export_csv_success`, user.id, { 
            brief_id, 
            rows_exported: exportData.length 
          });
          
          // Return CSV with appropriate headers
          return new Response(csvContent, {
            headers: {
              ...getCorsHeaders(req),
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="suppliers-brief-${brief_id}.csv"`
            }
          });
        } else {
          // Return JSON data for other formats (could be extended for XLS)
          result = {
            data: exportData,
            total_rows: exportData.length,
            format: format
          };
        }
        break;
        
      default:
        throw new HttpError(`Unsupported action: ${action}`, 400);
    }
    
    // Analytics tracking
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_${action}_success`, user.id, { brief_id, format });
    } catch (trackError) {
      console.error('Failed to track event:', trackError);
    }
    
    // Response
    return corsResponse({ success: true, data: result }, req);
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
