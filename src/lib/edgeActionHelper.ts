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
    
    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }
    
    // Generate a unique request ID
    const requestId = crypto.randomUUID();
    
    // Get API URL from environment
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    
    const url = `${SUPABASE_URL}/functions/v1/${endpoint}`;
    
    // Make the request with all proper headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    return data;
    
  } catch (error: any) {
    devLog(`Error executing edge action ${endpoint}/${action}`, { error }, true);
    throw error;
  }
}
