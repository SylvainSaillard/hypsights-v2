// Define the allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://hypsights-v2.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:52531' // Additional local development port
];

// Define the base CORS headers structure
export const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
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
export function getCorsHeaders(req: Request) {
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': getAllowedOrigin(req)
  };
}
