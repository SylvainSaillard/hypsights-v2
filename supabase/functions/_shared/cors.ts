// Define the allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'https://hypsights.com',
  'https://hypsights-v2.vercel.app', 
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531' // Additional local development port
];

// Define the base CORS headers structure
export const CORS_HEADERS = {
  'Access-Control-Allow-Headers': [
    'authorization',
    'x-client-info', 
    'apikey',
    'content-type',
    'x-user-locale',
    'x-request-id',
    'accept',
    'accept-encoding',
    'accept-language',
    'cache-control',
    'pragma'
  ].join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

/**
 * Returns the allowed origin based on the request's origin header.
 * If the origin is in the allowed list, it returns that origin.
 * Otherwise, defaults to the production URL for security.
 */
export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  
  // Return the origin if it's in the allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Default to the production URL
  return 'https://hypsights-v2.netlify.app';
}

/**
 * Returns a complete set of CORS headers optimized for production use.
 * Sets the origin dynamically based on the request.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': getAllowedOrigin(req)
  };
}

/**
 * Helper function to create a standardized CORS-enabled Response.
 * This centralizes CORS header application and prevents missing headers.
 */
export function corsResponse(
  data: any, 
  req: Request, 
  init: ResponseInit = {}
): Response {
  const headers = {
    ...getCorsHeaders(req),
    'Content-Type': 'application/json',
    ...(init.headers || {})
  };

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    { ...init, headers }
  );
}

/**
 * Helper function to handle OPTIONS preflight requests.
 * Returns a 204 response with appropriate CORS headers if it's an OPTIONS request.
 * Otherwise returns null to continue processing the request.
 */
export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }
  return null;
}
