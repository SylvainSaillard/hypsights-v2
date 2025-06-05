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
            <p className="text-gray-600 mb-3">{briefData?.brief?.description || 'Aucune description'}</p>
            
            {/* Tags section */}
            <div className="flex flex-wrap gap-2 text-sm mb-3">
              {/* Status */}
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {briefData?.brief?.status === 'draft' ? 'Brouillon' : 'Actif'}
              </span>
              
              {/* Locale */}
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {briefData?.brief?.default_locale === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </span>

              {/* Visuel uniquement */}
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                Mode visuel uniquement
              </span>
            </div>
            
            {/* Capabilities */}
            {briefData?.brief?.capabilities && briefData.brief.capabilities.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Compétences recherchées:</h3>
                <div className="flex flex-wrap gap-1">
                  {briefData.brief.capabilities.map((cap: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Maturity */}
            {briefData?.brief?.maturity && briefData.brief.maturity.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Maturité:</h3>
                <div className="flex flex-wrap gap-1">
                  {briefData.brief.maturity.map((mat: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Geographies */}
            {briefData?.brief?.geographies && briefData.brief.geographies.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Zones géographiques:</h3>
                <div className="flex flex-wrap gap-1">
                  {briefData.brief.geographies.map((geo: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {geo}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
