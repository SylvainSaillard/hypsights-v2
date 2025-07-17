import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';

const SearchResultsPage: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Fetch brief details
  const { 
    data: briefData, 
    loading: briefLoading, 
    error: briefError 
  } = useEdgeFunction(
    'brief-operations',
    { action: 'get_brief', brief_id: briefId },
    { method: 'POST', enabled: !!briefId }
  );

  // Fetch search results from the correct handler
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError
  } = useEdgeFunction(
    'fast-search-handler',
    { action: 'get_fast_search_results', brief_id: briefId },
    { method: 'POST', enabled: !!briefId }
  );

  // Request deep search
  const handleRequestDeepSearch = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brief-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_deep_search',
          brief_id: briefId
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to request deep search');
      }
      
      // Show confirmation to user
      alert('Deep search request submitted successfully. Our team will contact you shortly.');
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Deep search request error:', err);
    }
  };

  if (briefLoading || searchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Loading search results...</div>
      </div>
    );
  }

  if (briefError || searchError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <h2 className="text-lg font-medium text-red-800">Error Loading Data</h2>
        <p className="text-sm text-red-700 mt-2">{briefError || searchError}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const brief = briefData?.brief;
  const suppliers = searchData?.suppliers || [];
  const hasResults = suppliers.length > 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600">{brief?.title}</p>
        </div>
        <button
          onClick={() => navigate(`/dashboard/briefs/${briefId}/chat`)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Brief
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-card border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Fast Search Results</h2>
            <p className="text-sm text-gray-500">
              {hasResults 
                ? `Found ${suppliers.length} potential suppliers` 
                : 'No results found from fast search'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRequestDeepSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm text-sm font-medium hover:scale-105 transition duration-200"
            >
              Request Deep Search
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {!hasResults ? (
            <div className="text-center py-12">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-300 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We couldn't find any suppliers matching your criteria in our automated search.
              </p>
              <button
                onClick={handleRequestDeepSearch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm text-sm font-medium hover:scale-105 transition duration-200"
              >
                Request Expert Deep Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {suppliers.map((supplier: any) => (
                <div key={supplier.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <a 
                        href={supplier.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-gray-900 hover:text-primary hover:underline"
                      >
                        {supplier.name}
                      </a>
                      <p className="text-sm text-gray-500">{supplier.short_description}</p>
                    </div>
                    {supplier.match_profile && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {supplier.match_profile.overall_match_score}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{supplier.long_description}</p>

                  {supplier.match_profile && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Match Profile</h4>
                      <p className="text-xs text-gray-500"><span className="font-medium">Strengths:</span> {supplier.match_profile.strengths}</p>
                      <p className="text-xs text-gray-500"><span className="font-medium">Weaknesses:</span> {supplier.match_profile.weaknesses}</p>
                    </div>
                  )}

                  {supplier.products && supplier.products.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products.map((product: any) => (
                          <span 
                            key={product.id} 
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                          >
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="w-full px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 mt-2"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-blue-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Deep Search</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Our team of experts will manually research and identify the best suppliers for your specific needs. 
                We'll reach out to you directly to discuss the results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
