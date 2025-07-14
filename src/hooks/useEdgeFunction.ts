import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { devLog } from '../lib/devTools';

/**
 * Simplified Edge Function hook that always uses real API calls
 * Following the Hypsights architecture pattern: Thin Client / Fat Edge
 * 
 * @param endpoint - The Edge Function endpoint name (without base URL)
 * @param params - Optional parameters to send to the edge function
 * @param method - HTTP method to use (default: 'POST')
 * @returns Object containing data, loading state, error, and refresh function
 */
export function useEdgeFunction(
  endpoint: string, 
  params: Record<string, any> = {},
  method: 'GET' | 'POST' = 'POST'
) {
  const [state, setState] = useState<{
    data: any;
    loading: boolean;
    error: string | null;
  }>({ 
    data: null, 
    loading: true, 
    error: null 
  });
  
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Detect environment for debugging purposes - defined outside of fetch to be available in catch block
  const getEnvironment = () => (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'development' 
    : 'production';
  
  const fetchData = useCallback(async () => {
    // Ne pas exécuter la requête si l'action n'est pas spécifiée.
    // Cela évite les appels non désirés au chargement du composant.
    if (!params || !params.action) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Generate a unique request ID to prevent duplicate submissions
      // This is especially important with React.StrictMode double-rendering
      const requestId = crypto.randomUUID();
      
      // Get the current user session to extract JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use JWT token for authenticated routes, fallback to ANON_KEY for public endpoints
      const token = session?.access_token || SUPABASE_ANON_KEY;
      
      // Prepare request options
      let url = `${SUPABASE_URL}/functions/v1/${endpoint}`;
      
      // Get current environment
      const environment = getEnvironment();
      
      // Detect if we're running on localhost but with a port other than 3000
      // Our Edge Functions expect localhost:3000 but development servers may use different ports
      const isNonStandardLocalPort = environment === 'development' && 
                                  window.location.port !== '' && 
                                  window.location.port !== '3000';
      

      let options: RequestInit = {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-client-info': `Hypsights V2 React Client (${environment})`,
          'x-user-locale': 'en', // Default to English, can be overridden by user preference
          'x-request-id': requestId, // Send request ID for deduplication
          // For local development, pretend to be from localhost:3000 which is allowed by Edge Functions
          'Origin': isNonStandardLocalPort ? 'http://localhost:3000' : window.location.origin
        },
        // Always include credentials for both dev and prod
        // This matches the Access-Control-Allow-Credentials: true in Edge Functions
        credentials: 'include',
        // Always use cors mode
        mode: 'cors'
      };
      
      // Add user locale from preference if available
      const userLocale = localStorage.getItem('userLocale');
      if (userLocale && options.headers) {
        (options.headers as Record<string, string>)['x-user-locale'] = userLocale;
      }
      
      // Handle different HTTP methods
      if (method === 'GET' && Object.keys(params).length > 0) {
        // For GET requests, add params to URL
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.set(key, String(value));
          }
        });
        url += `?${queryParams.toString()}`;
      } else if (method === 'POST') {
        // For POST requests, add params to body
        // Always include request_id for deduplication in edge functions
        options.body = JSON.stringify({
          ...params,
          request_id: requestId
        });
      }
      
      devLog(`Calling Edge Function: ${endpoint}`, {
        method,
        requestId,
        params
      });
      
      // For development environments with CORS issues, use an approach to handle the request
      // In production, this will use the normal fetch
      let response;
      try {
        response = await fetch(url, options);
      } catch (fetchError) {
        // If we get a CORS error, log it with helpful context
        devLog(`CORS error calling Edge Function: ${endpoint}`, {
          error: fetchError,
          url,
          origin: window.location.origin,
          requestId
        }, true);
        
        throw new Error(`CORS error: ${fetchError}. Your development server is running on ${window.location.origin} but Edge Functions expect http://localhost:3000. Try running your dev server on port 3000.`);
      }
      
      // Handle potential non-JSON response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Log the response details for better debugging
        devLog(`Non-JSON response from ${endpoint}`, { 
          error: text,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          url: response.url
        }, true); // Using true flag to indicate error
        throw new Error(`Invalid response from server: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
      
      if (!response.ok) {
        // Enhanced error logging with response details
        devLog(`Error response from ${endpoint}`, { 
          error: data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          url: response.url
        }, true); // Using true flag to indicate error
        throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
      }
      
      setState({ 
        data, 
        loading: false, 
        error: null 
      });
    } catch (error: any) {
      // Enhanced error logging for fetch errors
      devLog(`Error fetching from ${endpoint}`, { 
        error, 
        message: error.message, 
        stack: error.stack,
        params,
        url: `${SUPABASE_URL}/functions/v1/${endpoint}`,
        environment: getEnvironment(),
        origin: window.location.origin
      }, true);
      
      setState({ 
        data: null, 
        loading: false, 
        error: error.message || 'An unknown error occurred' 
      });
    }
  }, [endpoint, JSON.stringify(params), method, SUPABASE_URL, SUPABASE_ANON_KEY]);
  
  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);
  
  return { 
    ...state, 
    refresh: fetchData 
  };
}

export default useEdgeFunction;
