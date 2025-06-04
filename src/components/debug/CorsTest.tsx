import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { devLog } from '../../lib/devTools';

// List of Edge Functions to test
const edgeFunctions = [
  { name: 'i18n-handler', action: 'get_languages', params: {} },
  { name: 'brief-operations', action: 'list_briefs', params: {} },
  { name: 'notifications', action: 'list_notifications', params: {} },
  { name: 'dashboard-data', action: 'get_dashboard_data', params: {} },
  { name: 'chat-handler', action: 'get_history', params: { brief_id: 'any' } },
  { name: 'search-handler', action: 'check_quota', params: {} },
  { name: 'ai-chat-handler', action: 'test_n8n_webhook', params: {}, highlight: true }
];

// Different fetch configurations to test
const fetchConfigs = [
  { name: 'Default', options: {} },
  { name: 'With credentials', options: { credentials: 'include' } },
  { name: 'Omit credentials', options: { credentials: 'omit' } },
  { name: 'No-cors mode', options: { mode: 'no-cors' } },
  { name: 'Cors mode', options: { mode: 'cors' } },
  { name: 'Cors + Include credentials', options: { mode: 'cors', credentials: 'include' } },
  { name: 'Cors + Omit credentials', options: { mode: 'cors', credentials: 'omit' } }
];

const CorsTest: React.FC = () => {
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [errors, setErrors] = useState<{[key: string]: string | null}>({});
  const [token, setToken] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('Default');
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  // Get information about the current network state
  const checkNetworkStatus = () => {
    const info = {
      online: navigator.onLine,
      connectionType: (navigator as any).connection?.type || 'unknown',
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      saveData: (navigator as any).connection?.saveData || false,
      userAgent: navigator.userAgent,
      host: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol
    };
    
    setNetworkInfo(info);
    devLog('Network status', info);
    return info;
  };

  // Get the user's JWT token
  const getToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      setToken(session.access_token);
      return session.access_token;
    } catch (err: any) {
      console.error('Failed to get auth token:', err);
      return null;
    }
  };
  
  // Test a single Edge Function with the selected fetch configuration
  const testEdgeFunction = async (funcName: string, action: string, params: any = {}) => {
    try {
      setLoading(prev => ({ ...prev, [funcName]: true }));
      setErrors(prev => ({ ...prev, [funcName]: null }));
      
      const currentToken = token || await getToken();
      if (!currentToken) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      // Get the selected fetch configuration
      const configName = selectedConfig;
      const config = fetchConfigs.find(c => c.name === configName) || fetchConfigs[0];
      
      devLog(`Testing ${funcName} with action: ${action} using config: ${config.name}`, config);
      
      // Call the Edge Function
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${funcName}`;
      
      const requestId = crypto.randomUUID();
      
      // Build fetch options with the selected configuration
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'x-client-info': 'Hypsights V2 CORS Debug',
          'x-user-locale': 'en',
          'x-request-id': requestId
        },
        body: JSON.stringify({
          action,
          ...params,
          request_id: requestId
        }),
        ...config.options as RequestInit
      };
      
      devLog(`Calling Edge Function: ${url}`, { options });
      
      const response = await fetch(url, options);
      
      let data: any;
      let responseText: string;
      
      try {
        responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { raw: responseText }; // Keep as text if not JSON
        }
      } catch (textError) {
        // If we can't get text (e.g., with no-cors), just return status
        data = { status: response.status, type: response.type };
        responseText = 'Unable to read response body';
      }
      
      const responseDetails = {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        type: response.type,
        redirected: response.redirected,
        ok: response.ok,
        bodyUsed: response.bodyUsed
      };
      
      devLog(`${funcName} response:`, responseDetails);
      
      if (!response.ok && response.status !== 0) { // Status 0 for no-cors
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Save the result
      setResults(prev => ({
        ...prev,
        [funcName]: {
          data,
          ...responseDetails
        }
      }));
      
      devLog(`${funcName} test successful:`, data);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error';
      setErrors(prev => ({ ...prev, [funcName]: errorMessage }));
      devLog(`${funcName} test failed:`, err, true);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [funcName]: false }));
    }
  };
  
  // Test all Edge Functions
  const testAllFunctions = async () => {
    // Check network status
    checkNetworkStatus();
    
    // First get the token
    await getToken();
    
    // Then test each function
    for (const func of edgeFunctions) {
      await testEdgeFunction(func.name, func.action, func.params);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">CORS Testing Panel</h2>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={getToken}
            disabled={loading['token']}
          >
            {loading['token'] ? 'Loading...' : 'Get Auth Token'}
          </button>
          
          {token && (
            <div className="mt-2">
              <span className="font-semibold">Token:</span>
              <span className="ml-2 text-xs text-gray-600">{token.substring(0, 15)}...{token.substring(token.length - 10)}</span>
            </div>
          )}
        </div>
        
        <div>
          <button 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={checkNetworkStatus}
          >
            Check Network Status
          </button>
          
          {networkInfo && (
            <div className="mt-2 text-xs">
              <div><span className="font-semibold">Online:</span> {networkInfo.online ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold">Host:</span> {networkInfo.host}:{networkInfo.port}</div>
              <div><span className="font-semibold">Protocol:</span> {networkInfo.protocol}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fetch Configuration:</label>
        <select 
          className="w-full p-2 border rounded"
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
        >
          {fetchConfigs.map(config => (
            <option key={config.name} value={config.name}>
              {config.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={testAllFunctions}
          disabled={Object.values(loading).some(Boolean)}
        >
          {Object.values(loading).some(Boolean) ? 'Testing...' : 'Test All Edge Functions'}
        </button>
      </div>
      
      <div className="space-y-4">
        {edgeFunctions.map(func => (
          <div key={func.name} className={`border p-4 rounded ${func.highlight ? 'bg-blue-50 border-blue-300 shadow-sm' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{func.name}</h3>
              <div className="flex space-x-2">
                <div className="text-xs">
                  Action: <code className="bg-gray-100 px-1 py-0.5 rounded">{func.action}</code>
                </div>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                  onClick={() => testEdgeFunction(func.name, func.action, func.params)}
                  disabled={loading[func.name]}
                >
                  {loading[func.name] ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
            
            {errors[func.name] && (
              <div className="mb-2 text-red-500 text-sm border border-red-200 bg-red-50 p-2 rounded">
                Error: {errors[func.name]}
              </div>
            )}
            
            {results[func.name] && (
              <div className="bg-gray-50 p-2 rounded text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-semibold">Status:</span> {results[func.name].status}</div>
                  <div><span className="font-semibold">Type:</span> {results[func.name].type}</div>
                </div>
                <details>
                  <summary className="cursor-pointer text-blue-500 mt-2">View Response Headers</summary>
                  <div className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto max-h-40">
                    {Object.entries(results[func.name].headers || {}).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-mono">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </details>
                <details>
                  <summary className="cursor-pointer text-blue-500 mt-2">View Result Data</summary>
                  <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(results[func.name].data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Debugging Tips</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>If tests return status 0, they may be in "opaque" response mode due to CORS restrictions</li>
          <li>Check Chrome DevTools Network tab for more detailed CORS error information</li>
          <li>Ensure Edge Functions are updated with proper CORS headers</li>
          <li>Try different fetch configurations to see which one works best</li>
          <li>Ensure all required parameters are included in each request</li>
        </ul>
      </div>
    </div>
  );
};

export default CorsTest;
