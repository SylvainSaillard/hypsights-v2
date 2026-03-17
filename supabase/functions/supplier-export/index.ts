import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import ExcelJS from 'https://esm.sh/exceljs@4.3.0';

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
  // Supplier information (1 row per supplier)
  supplier_id: string;
  supplier_name: string;
  supplier_overview: string;
  supplier_country: string;
  supplier_company_size: string;
  supplier_website: string;
  
  // Best match scores
  overall_match_score: number;
  match_explanation: string;
  
  // Solution information (from best match)
  solution_title: string;
  
  // Best product information
  best_product_name: string;
  best_product_url: string;
  
  // Aggregated info
  products_found: number;
  hypsights_supplier_link: string;
}

async function getSupplierExportData(briefId: string): Promise<{ exportRows: ExportRow[], briefTitle: string }> {
  const supabaseAdmin = createSupabaseClient(true);
  
  // Get brief title first
  const { data: briefData, error: briefError } = await supabaseAdmin
    .from('briefs')
    .select('title')
    .eq('id', briefId)
    .single();

  if (briefError) {
    console.error('Error fetching brief:', briefError);
    throw new HttpError(`Failed to fetch brief: ${briefError.message}`, 500);
  }

  const briefTitle = briefData?.title || 'Unknown Brief';
  
  // Get all supplier matches for this brief, ordered by best score first
  const { data: matchData, error: matchError } = await supabaseAdmin
    .from('supplier_match_profiles')
    .select(`
      id,
      supplier_id,
      solution_id,
      overall_match_score,
      match_explanation
    `)
    .eq('brief_id', briefId)
    .order('overall_match_score', { ascending: false });

  if (matchError) {
    console.error('Error fetching supplier matches:', matchError);
    throw new HttpError(`Failed to fetch supplier matches: ${matchError.message}`, 500);
  }

  if (!matchData || matchData.length === 0) {
    return { exportRows: [], briefTitle };
  }

  // Get suppliers data
  const supplierIds = [...new Set(matchData.map(m => m.supplier_id))];
  const { data: suppliersData, error: suppliersError } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .in('id', supplierIds);

  if (suppliersError) {
    console.error('Error fetching suppliers:', suppliersError);
    throw new HttpError(`Failed to fetch suppliers: ${suppliersError.message}`, 500);
  }

  // Get solutions data
  const solutionIds = [...new Set(matchData.map(m => m.solution_id).filter(Boolean))];
  const { data: solutionsData, error: solutionsError } = await supabaseAdmin
    .from('solutions')
    .select('id, title, solution_number')
    .in('id', solutionIds);

  if (solutionsError) {
    console.error('Error fetching solutions:', solutionsError);
    throw new HttpError(`Failed to fetch solutions: ${solutionsError.message}`, 500);
  }

  // Get products data
  const { data: productsData, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('brief_id', briefId)
    .in('supplier_id', supplierIds);

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  // Create lookup maps
  const suppliersMap = new Map(suppliersData?.map(s => [s.id, s]) || []);
  const solutionsMap = new Map(solutionsData?.map(s => [s.id, s]) || []);
  const productsBySupplier = new Map<string, any[]>();
  
  productsData?.forEach(product => {
    if (!productsBySupplier.has(product.supplier_id)) {
      productsBySupplier.set(product.supplier_id, []);
    }
    productsBySupplier.get(product.supplier_id)!.push(product);
  });

  // Deduplicate: keep only the best match per supplier (highest overall_match_score)
  // matchData is already sorted by overall_match_score DESC, so first occurrence wins
  const bestMatchBySupplier = new Map<string, any>();
  for (const match of matchData) {
    if (!bestMatchBySupplier.has(match.supplier_id)) {
      bestMatchBySupplier.set(match.supplier_id, match);
    }
  }

  // Hypsights base URL for supplier links
  const hypsightsBaseUrl = 'https://hypsights.com';

  // Build 1 row per supplier
  const exportRows: ExportRow[] = [];
  
  for (const [supplierId, match] of bestMatchBySupplier) {
    const supplier = suppliersMap.get(supplierId);
    if (!supplier) continue;
    
    const solution = solutionsMap.get(match.solution_id);
    const products = productsBySupplier.get(supplierId) || [];
    
    // Find the best product (by name presence + url presence as quality heuristic)
    let bestProduct: any = null;
    if (products.length > 0) {
      // Prefer products that have both a name and a URL
      bestProduct = products.find((p: any) => p.name && p.url) 
        || products.find((p: any) => p.name) 
        || products[0];
    }
    
    exportRows.push({
      supplier_id: supplierId,
      supplier_name: supplier.name || '',
      supplier_overview: supplier.company_overview || supplier.description || '',
      supplier_country: supplier.country || 'N/A',
      supplier_company_size: supplier.company_size || 'N/A',
      supplier_website: supplier.url || supplier.website || '',
      
      overall_match_score: match.overall_match_score || 0,
      match_explanation: match.match_explanation || '',
      
      solution_title: solution?.title || '',
      
      best_product_name: bestProduct?.name || '',
      best_product_url: bestProduct?.url || '',
      
      products_found: products.length,
      hypsights_supplier_link: `${hypsightsBaseUrl}/dashboard/brief/${briefId}?supplier=${supplierId}`
    });
  }
  
  // Sort by overall_match_score descending (already mostly sorted, but ensure after dedup)
  exportRows.sort((a, b) => b.overall_match_score - a.overall_match_score);
  
  return { exportRows, briefTitle };
}

async function convertToXLSX(data: ExportRow[]): Promise<Uint8Array> {
  const workbook = new (ExcelJS as any).Workbook();
  const worksheet = workbook.addWorksheet('Suppliers');

  // Column definitions with widths
  const columns = [
    { header: 'Supplier Name', key: 'supplier_name', width: 30 },
    { header: 'Overview', key: 'supplier_overview', width: 50 },
    { header: 'Country', key: 'supplier_country', width: 18 },
    { header: 'Company Size', key: 'supplier_company_size', width: 16 },
    { header: 'Website', key: 'supplier_website', width: 35 },
    { header: 'Match Score', key: 'overall_match_score', width: 14 },
    { header: 'AI Evaluation', key: 'match_explanation', width: 50 },
    { header: 'Solution', key: 'solution_title', width: 30 },
    { header: 'Best Product', key: 'best_product_name', width: 30 },
    { header: 'Product URL', key: 'best_product_url', width: 35 },
    { header: 'Products Found', key: 'products_found', width: 16 },
    { header: 'Hypsights Link', key: 'hypsights_supplier_link', width: 35 }
  ];

  // Header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.values = columns.map(c => c.header);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell(cell => {
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Set column widths
  columns.forEach((col, i) => {
    worksheet.getColumn(i + 1).width = col.width;
  });

  // Indices for hyperlink columns (1-based)
  const websiteCol = 5;
  const productUrlCol = 10;
  const hypsightsLinkCol = 12;

  // Add data rows
  data.forEach((row, index) => {
    const rowIndex = index + 2;
    const dataRow = worksheet.getRow(rowIndex);
    dataRow.values = [
      row.supplier_name,
      row.supplier_overview,
      row.supplier_country,
      row.supplier_company_size,
      row.supplier_website,
      row.overall_match_score,
      row.match_explanation,
      row.solution_title,
      row.best_product_name,
      row.best_product_url,
      row.products_found,
      row.hypsights_supplier_link
    ];

    // Default alignment
    dataRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    });

    // Make Website clickable
    if (row.supplier_website) {
      const cell = dataRow.getCell(websiteCol);
      cell.value = { text: row.supplier_website, hyperlink: row.supplier_website };
      cell.font = { color: { argb: 'FF0563C1' }, underline: true };
    }

    // Make Product URL clickable
    if (row.best_product_url) {
      const cell = dataRow.getCell(productUrlCol);
      cell.value = { text: row.best_product_url, hyperlink: row.best_product_url };
      cell.font = { color: { argb: 'FF0563C1' }, underline: true };
    }

    // Make Hypsights Link clickable
    if (row.hypsights_supplier_link) {
      const cell = dataRow.getCell(hypsightsLinkCol);
      cell.value = { text: 'View on Hypsights', hyperlink: row.hypsights_supplier_link };
      cell.font = { color: { argb: 'FF0563C1' }, underline: true };
    }

    // Alternate row shading for readability
    if (index % 2 === 1) {
      dataRow.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      });
    }
  });

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

function convertToCSV(data: ExportRow[]): string {
  if (data.length === 0) {
    return 'No data available';
  }
  
  // Headers matching the new 1-row-per-supplier structure
  const headers = [
    'Supplier Name',
    'Overview',
    'Country',
    'Company Size',
    'Website',
    'Match Score',
    'AI Evaluation',
    'Solution',
    'Best Product',
    'Product URL',
    'Products Found',
    'Hypsights Link'
  ];
  
  // Convert data to CSV rows
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const csvRow = [
      escapeCSV(row.supplier_name),
      escapeCSV(row.supplier_overview),
      escapeCSV(row.supplier_country),
      escapeCSV(row.supplier_company_size),
      escapeCSV(row.supplier_website),
      row.overall_match_score.toString(),
      escapeCSV(row.match_explanation),
      escapeCSV(row.solution_title),
      escapeCSV(row.best_product_name),
      escapeCSV(row.best_product_url),
      row.products_found.toString(),
      escapeCSV(row.hypsights_supplier_link)
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

function sanitizeFilename(title: string): string {
  // Remove or replace characters that are not allowed in filenames
  return title
    .replace(/[<>:"/\\|?*]/g, '-') // Replace forbidden characters with dash
    .replace(/\s+/g, '-') // Replace spaces with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 50) // Limit length to 50 characters
    .toLowerCase();
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
        const { exportRows, briefTitle } = await getSupplierExportData(brief_id);
        
        const sanitizedTitle = sanitizeFilename(briefTitle);

        if (format === 'csv') {
          const csvContent = convertToCSV(exportRows);
          await trackEvent(createSupabaseClient(true), `${FUNCTION_NAME}_export_csv_success`, user.id, { 
            brief_id, brief_title: briefTitle, rows_exported: exportRows.length 
          });
          return new Response(csvContent, {
            headers: {
              ...getCorsHeaders(req),
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="suppliers-${sanitizedTitle}.csv"`
            }
          });
        } else if (format === 'xlsx') {
          const xlsxContent = await convertToXLSX(exportRows);
          await trackEvent(createSupabaseClient(true), `${FUNCTION_NAME}_export_xlsx_success`, user.id, { 
            brief_id, brief_title: briefTitle, rows_exported: exportRows.length 
          });
          return new Response(xlsxContent, {
            headers: {
              ...getCorsHeaders(req),
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="suppliers-${sanitizedTitle}.xlsx"`
            }
          });
        } else {
          // Fallback for unknown formats
          result = {
            data: exportRows,
            brief_title: briefTitle,
            total_rows: exportRows.length,
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
