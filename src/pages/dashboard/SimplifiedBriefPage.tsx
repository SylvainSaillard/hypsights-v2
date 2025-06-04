import React from 'react';
import { useParams } from 'react-router-dom';
import SimplifiedChatView from '../../components/chat/SimplifiedChatView';
import useEdgeFunction from '../../hooks/useEdgeFunction';

/**
 * Page simplifiée pour afficher uniquement l'interface visuelle du brief
 * sans appels backend ni chat fonctionnel
 */
const SimplifiedBriefPage: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  
  // Fetch brief details only
  const { 
    data: briefData, 
    loading: briefLoading
  } = useEdgeFunction(
    'brief-operations',
    { action: 'get_brief', brief_id: briefId },
    'POST'
  );

  // Loading state
  if (briefLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-hypsights-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement du brief...</p>
        </div>
      </div>
    );
  }

  // Main component with simplified view
  return (
    <div className="bg-hypsights-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Brief Header */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold mb-2">{briefData?.brief?.title || 'Brief en cours de chargement'}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {briefData?.brief?.industry || 'Industrie'}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {briefData?.brief?.budget_range || 'Budget'}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {briefData?.brief?.timeline || 'Timeline'}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                Mode visuel uniquement
              </span>
            </div>
          </div>
          
          {/* Simplified Chat View */}
          <SimplifiedChatView 
            briefTitle={briefData?.brief?.title || 'Interface simplifiée'} 
            briefDescription={briefData?.brief?.description || 'Mode visuel sans appels n8n'} 
            briefId={briefId || 'unknown'} 
          />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedBriefPage;
