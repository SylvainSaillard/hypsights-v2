import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';
// Import components
import { Message } from '../../components/chat/ChatInterface';
import SimplifiedChatView from '../../components/chat/SimplifiedChatView';
import { devLog } from '../../lib/devTools';

// Mode simplifié sans appels n8n - activé par défaut
const SIMPLIFIED_MODE = true; // Mettre à false pour réactiver les appels au backend

interface Solution {
  id: string;
  name: string;
  description: string;
  match_score: number;
  capabilities: string[];
  is_validated: boolean;
}

interface Brief {
  id: string;
  title: string;
  description: string;
  industry: string;
  budget_range: string;
  timeline: string;
  status: 'draft' | 'active';
  created_at: string;
  updated_at: string;
}

interface SearchQuota {
  used: number;
  limit: number;
  remaining: number;
}

const BriefChatPage: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null); // Used for displaying errors to users
  
  // No development mode check or mock data - following the simplified architecture
  
  // If there's no briefId in the URL, redirect to dashboard
  useEffect(() => {
    if (!briefId) {
      navigate('/dashboard');
    }
  }, [briefId, navigate]);
  
  // Fetch brief details
  const { 
    data: briefData, 
    loading: briefLoading, 
    error: briefError
    // We keep refreshBrief available for potential future use
  } = useEdgeFunction(
    'brief-operations',
    { action: 'get_brief', brief_id: briefId },
    'POST'
  );

  // Fetch chat messages - conditionnellement en fonction du mode
  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
    refresh: refreshChat
  } = SIMPLIFIED_MODE ? {
    data: { messages: [] },
    loading: false,
    error: null,
    refresh: () => Promise.resolve()
  } : useEdgeFunction(
    'ai-chat-handler',
    { 
      action: 'get_messages', 
      brief_id: briefId
    },
    'POST'
  );

  // Fetch solutions - conditionnellement en fonction du mode
  const {
    data: solutionsData,
    loading: solutionsLoading,
    error: solutionsError,
    refresh: refreshSolutions
  } = SIMPLIFIED_MODE ? {
    data: { solutions: [] },
    loading: false,
    error: null,
    refresh: () => Promise.resolve()
  } : useEdgeFunction(
    'ai-chat-handler',
    { 
      action: 'get_solutions', 
      brief_id: briefId
    },
    'POST'
  );
  
  // Check search quota - simulé en mode simplifié
  const {
    data: quotaData
    // We intentionally don't destructure loading and error states
    // as they're handled by the parent loading and error UI states
  } = SIMPLIFIED_MODE ? {
    data: { used: 0, limit: 3, remaining: 3 }
  } : useEdgeFunction(
    'ai-chat-handler',
    { 
      action: 'check_search_quota'
    },
    'POST'
  );
  
  // Extract data from the response
  const searchQuota: SearchQuota = {
    used: quotaData?.used || 0,
    limit: quotaData?.limit || 3,
    remaining: quotaData?.remaining || 0
  };

  // Handle sending new message - all business logic handled by Edge Function
  const handleSendMessage = async (message: string) => {
    if (!briefId) return;
    
    try {
      devLog('Sending message to AI chat handler', { briefId, message });
      
      // Use Edge Function hook's refresh method with params to send the message
      // Type assertion used to match the implementation in useEdgeFunction
      await (refreshChat as (params?: Record<string, any>) => Promise<void>)({
        action: 'send_message',
        brief_id: briefId,
        message
      });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Handle solution validation - all business logic handled by Edge Function
  const handleValidateSolution = async (solutionId: string) => {
    if (!briefId) return;
    
    try {
      setIsValidating(true);
      setError(null);
      
      devLog('Validating solution', { briefId, solutionId });
      
      // Use Edge Function hook's refresh method with params to validate the solution
      await (refreshSolutions as (params?: Record<string, any>) => Promise<void>)({
        action: 'validate_solution',
        brief_id: briefId,
        solution_id: solutionId
      });
      
      setIsValidating(false);
    } catch (error) {
      console.error('Failed to validate solution:', error);
      setError('Failed to validate solution. Please try again.');
      setIsValidating(false);
    }
  };
  
  // Handle starting the fast search
  const handleStartSearch = async () => {
    if (!briefId) return;
    
    try {
      devLog('Starting Fast Search', { briefId });
      
      // Call the Edge Function to start the search
      await (refreshChat as (params?: Record<string, any>) => Promise<void>)({
        action: 'start_search',
        brief_id: briefId
      });
      
      // Navigate to search results page
      navigate(`/dashboard/search-results/${briefId}`);
      
    } catch (error) {
      console.error('Failed to start search:', error);
      setError('Failed to start search. Please try again.');
    }
  };
  
  // In development mode, use an effect to rebuild UI when data changes
  const brief: Brief = briefData?.brief || {} as Brief;
  const messages: Message[] = chatData?.messages || [];
  const solutions: Solution[] = solutionsData?.solutions || [];
  const hasValidatedSolutions = solutions.some(solution => solution.is_validated);
  
  // Log debugging information in development
  useEffect(() => {
    devLog('BriefChatPage data', { brief, messages, solutions, hasValidatedSolutions });
  }, [brief, messages, solutions, hasValidatedSolutions]);

  // Show loading state if any of our data is still loading
  if (briefLoading || chatLoading || solutionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-hypsights-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading brief details...</p>
        </div>
      </div>
    );
  }

  // Show error state if any of our data failed to load or if there's a user action error
  if (briefError || chatError || solutionsError || error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-4">
          {error || 'Failed to load brief details. Please try again later.'}
        </p>
        <div className="flex gap-4">
          {error && (
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:scale-105 transition duration-200"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Return null if brief is not found
  if (!brief) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-hypsights-background">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-xl mb-4">Brief Not Found</div>
          <p className="text-gray-700 mb-4">
            The brief you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:scale-105 transition duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main component rendering with all data available
  return (
    <div className="bg-hypsights-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Brief Header */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">{brief.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {brief.industry}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {brief.budget_range}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {brief.timeline}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                Status: {brief.status}
              </span>
            </div>
            <p className="mt-4 text-gray-700">{brief.description}</p>
          </div>
          
          {/* Mode simplifié ou mode complet */}
          {SIMPLIFIED_MODE ? (
            // Mode simplifié - juste l'interface visuelle sans appels à n8n
            <SimplifiedChatView
              briefTitle={brief.title}
              briefDescription={brief.description}
              briefId={briefId || '0'}
            />
          ) : (
            // Mode complet avec toutes les fonctionnalités
            <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Chat Interface */}
            <div className="bg-gray-50 rounded-lg p-4 h-[500px] flex flex-col">
              <h2 className="text-xl font-semibold mb-3">AI Assistant Chat</h2>
              
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message: Message) => (
                    <div 
                      key={message.id} 
                      className={`p-3 rounded-lg ${message.type === 'user' 
                        ? 'bg-blue-100 ml-8' 
                        : 'bg-gray-200 mr-8'}`}
                    >
                      <div className="font-medium mb-1">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <p>Start a conversation with the AI assistant.</p>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex"
                >
                  <input
                    type="text"
                    name="message"
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:scale-105 transition duration-200"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
            
            {/* Right Column: Solutions and Fast Search */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Suggested Solutions</h2>
              <div className="space-y-4">
                {solutions.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-gray-500">Ask the AI assistant to suggest solutions for your brief.</p>
                    <p className="mt-2 text-sm text-blue-500">Try asking: "Can you suggest some solutions for my brief?"</p>
                  </div>
                ) : (
                  solutions.map((solution: Solution) => (
                    <div key={solution.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-purple-900">{solution.name}</h3>
                          <p className="mt-1 text-sm text-purple-700">{solution.description}</p>
                          
                          {solution.capabilities && solution.capabilities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {solution.capabilities.map((capability: string, index: number) => (
                                <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                  {capability}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <span className="inline-block bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                            {solution.match_score}% Match
                          </span>
                        </div>
                      </div>
                      
                      {!solution.is_validated ? (
                        <button
                          onClick={() => handleValidateSolution(solution.id)}
                          disabled={isValidating}
                          className="mt-3 w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex justify-center items-center"
                        >
                          {isValidating ? (
                            <>
                              <span className="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                              Validating...
                            </>
                          ) : (
                            'Validate Solution'
                          )}
                        </button>
                      ) : (
                        <div className="mt-3 flex items-center justify-center text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Solution Validated</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
              </>
            )}
            </div>
            
            {/* Fast Search Section */}
            {hasValidatedSolutions && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">Ready to Search</h3>
                    <p className="text-sm text-green-700">
                      You've validated solutions and can now proceed with the Fast Search.
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                      Search quota: {searchQuota.used} of {searchQuota.limit} used ({searchQuota.remaining} remaining)
                    </div>
                  </div>
                  <button
                    onClick={handleStartSearch}
                    disabled={searchQuota.remaining <= 0}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                      searchQuota.remaining > 0 
                        ? 'bg-primary text-primary-foreground hover:scale-105 transition duration-200' 
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Launch Fast Search
                  </button>
                </div>
              </div>
            )}
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefChatPage;
