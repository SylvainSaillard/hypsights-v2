import { supabase } from './supabaseClient';
import { devLog } from './devTools';

/**
 * Helper function to execute a single action on an Edge Function
 * This follows the Hypsights V2 architecture pattern of using a single
 * standard way to interact with Edge Functions with proper authentication
 */
export async function executeEdgeAction(
  endpoint: string,
  action: string,
  params: Record<string, any> = {}
): Promise<any> {
  try {
    // Get the current user session to extract JWT token
    const { data: { session } } = await supabase.auth.getSession();
    
    // Use JWT token for authenticated routes, fallback to ANON_KEY for public endpoints
    const token = session?.access_token;
    
    // List of public endpoints that can work with ANON_KEY
    const publicEndpoints = ['i18n-handler'];
    
    // Only throw authentication error if this is not a public endpoint
    if (!token && !publicEndpoints.includes(endpoint)) {
      throw new Error('No authentication token available. Please login again.');
    }
    
    // Use SUPABASE_ANON_KEY from env for public endpoints when no token is available
    const authToken = token || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Generate a unique request ID
    const requestId = crypto.randomUUID();
    
    // Get API URL from environment
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    
    const url = `${SUPABASE_URL}/functions/v1/${endpoint}`;
    
    // Make the request with all proper headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'x-client-info': 'Hypsights V2 React Client',
        'x-request-id': requestId
      },
      body: JSON.stringify({
        action,
        request_id: requestId,
        ...params
      }),
      credentials: 'include'
    });
    
    // Parse the response
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error (${response.status}): `;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += errorJson.error || errorText;
      } catch {
        errorMessage += errorText;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`executeEdgeAction - Réponse de ${endpoint}/${action}:`, data);
    
    // Vérifier si la réponse est encapsulée dans un objet success/data
    if (data && typeof data === 'object') {
      if ('success' in data && data.success === true && 'data' in data) {
        // Format standard de réponse de l'Edge Function
        console.log(`executeEdgeAction - Extraction des données de la réponse standard`);
        return data.data;
      }
    }
    
    // Sinon retourner la réponse telle quelle
    return data;
    
  } catch (error: any) {
    devLog(`Error executing edge action ${endpoint}/${action}`, { error }, true);
    throw error;
  }
}
