// Define the base CORS headers structure
export const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-locale, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*' // Allow all origins by default
};

// Function to get dynamic CORS headers based on the request
export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin || '*'
  };
}
