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

const FUNCTION_NAME = 'supplier-pdf-export';

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

function generateHtmlForPdf(data: any): string {
  const { brief, supplier, matches, solutions, products } = data;

  const overallMatchScore = matches.length > 0 ? Math.round(matches.reduce((acc: any, m: any) => acc + m.overall_match_score, 0) / matches.length) : 0;

  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { width: 100%; max-width: 800px; margin: 0 auto; padding: 30px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #1a202c; margin: 0; }
    .header p { font-size: 16px; color: #718096; margin: 5px 0 0; }
    .section { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #fdfdff; }
    .section h2 { font-size: 20px; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { background-color: #f7fafc; padding: 15px; border-radius: 6px; }
    .info-item strong { display: block; color: #4a5568; margin-bottom: 5px; }
    .ai-analysis { background-color: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; border-radius: 6px; }
    .product-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .product-table th, .product-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
    .product-table th { background-color: #f7fafc; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #a0aec0; }
  `;

  let html = `
    <html>
      <head><style>${styles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Supplier Report: ${supplier.name}</h1>
            <p>For Brief: ${brief.title}</p>
          </div>

          <div class="section">
            <h2>Supplier Profile</h2>
            <div class="grid">
              <div class="info-item"><strong>Name:</strong> ${supplier.name}</div>
              <div class="info-item"><strong>Website:</strong> <a href="${supplier.website}">${supplier.website}</a></div>
              <div class="info-item"><strong>Country:</strong> ${supplier.country || 'N/A'}</div>
              <div class="info-item"><strong>Company Size:</strong> ${supplier.company_size || 'N/A'}</div>
            </div>
            <div class="info-item" style="margin-top: 20px;"><strong>Overview:</strong> ${supplier.overview || supplier.description || 'No description available'}</div>
          </div>

          <div class="section">
            <h2>Hypsights AI Analysis (Overall Match: ${overallMatchScore}%)</h2>
            <div class="ai-analysis">
              ${matches.map((m: any) => `<p><strong>Solution: ${solutions.find((s:any) => s.id === m.solution_id)?.title || 'N/A'}</strong><br>${m.match_explanation}</p>`).join('')}
            </div>
          </div>

          ${products.length > 0 ? `
          <div class="section">
            <h2>Products</h2>
            <table class="product-table">
              <thead><tr><th>Name</th><th>Description</th></tr></thead>
              <tbody>
                ${products.map((p: any) => `<tr><td>${p.name}</td><td>${p.product_description || 'N/A'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by Hypsights | &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
}

async function getSupplierDataForPdf(briefId: string, supplierId: string) {
  const supabaseAdmin = createSupabaseClient(true);

  const { data: briefData, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('title')
    .eq('id', briefId)
    .single();

  if (briefError) throw new HttpError(`Failed to fetch brief: ${briefError.message}`, 500);

  const { data: supplierData, error: supplierError } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();

  if (supplierError) throw new HttpError(`Failed to fetch supplier: ${supplierError.message}`, 500);

  const { data: matchData, error: matchError } = await supabaseAdmin
    .from('supplier_match_profiles')
    .select('*')
    .eq('brief_id', briefId)
    .eq('supplier_id', supplierId);

  if (matchError) throw new HttpError(`Failed to fetch matches: ${matchError.message}`, 500);

  const solutionIds = [...new Set(matchData.map(m => m.solution_id).filter(Boolean))];
  const { data: solutionsData, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .in('id', solutionIds);

  if (solutionsError) throw new HttpError(`Failed to fetch solutions: ${solutionsError.message}`, 500);

  const { data: productsData, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('brief_id', briefId)
    .eq('supplier_id', supplierId);

  if (productsError) throw new HttpError(`Failed to fetch products: ${productsError.message}`, 500);

  return {
    brief: briefData,
    supplier: supplierData,
    matches: matchData,
    solutions: solutionsData,
    products: productsData,
  };
}

serve(async (req) => {
  console.log(`${FUNCTION_NAME} received ${req.method} request from ${req.headers.get('origin') || 'unknown'}`);  
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  
  try {
    const user = await authenticateUser(req);
    
    let requestBody = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch (error) {
      throw new HttpError('Invalid request body', 400);
    }
    
    const { brief_id, supplier_id } = requestBody as any;
    
    if (!brief_id || !supplier_id) {
      throw new HttpError('Missing required parameters: brief_id and/or supplier_id', 400);
    }

    const data = await getSupplierDataForPdf(brief_id, supplier_id);
    const htmlContent = generateHtmlForPdf(data);

    const apiKey = Deno.env.get('API2PDF_KEY');
    if (!apiKey) {
      throw new HttpError('PDF generation service is not configured. Missing API key.', 500);
    }

    const apiResponse = await fetch('https://v2018.api2pdf.com/chrome/html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({ html: htmlContent })

    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('Api2Pdf error:', errorBody);
      throw new HttpError(errorBody.message || 'Failed to generate PDF via external service.', 500);
    }

    // Api2Pdf returns a JSON response with a URL to the generated PDF
    const apiResult = await apiResponse.json();
    console.log('Api2Pdf result:', apiResult);
    
    if (!apiResult.success || !apiResult.pdf) {
      throw new HttpError(apiResult.error || 'PDF generation failed', 500);
    }

    // Download the actual PDF content from the provided URL
    const pdfResponse = await fetch(apiResult.pdf);
    if (!pdfResponse.ok) {
      throw new HttpError('Failed to download generated PDF', 500);
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer();

    await trackEvent(createSupabaseClient(true), `${FUNCTION_NAME}_success`, user.id, { brief_id, supplier_id });

    const sanitizedSupplierName = data.supplier.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    return new Response(pdfBuffer, {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="supplier-report-${sanitizedSupplierName}.pdf"`,
      },
    });

  } catch (error) {
    console.error(`Error in ${FUNCTION_NAME}:`, error);
    
    const statusCode = error instanceof HttpError ? error.status : 500;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    try {
      const supabaseAdmin = createSupabaseClient(true);
      await trackEvent(supabaseAdmin, `${FUNCTION_NAME}_error`, 'system', { error: errorMessage });
    } catch (loggingError) {
      console.error('Failed to log error event:', loggingError);
    }
    
    return corsResponse({ success: false, error: errorMessage }, req, { status: statusCode });
  }
});
