import React from 'react';
import { useParams } from 'react-router-dom';
import EnhancedChatView from '../../components/chat/EnhancedChatView';
import { SuppliersPanel } from '../../components/chat/SuppliersPanel';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';

/**
 * Page simplifiée pour afficher uniquement l'interface visuelle du brief
 * sans appels backend ni chat fonctionnel
 */
const SimplifiedBriefPage: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const { t } = useI18n();
  
  // Fetch brief details only
  const { 
    data: briefData, 
    loading: briefLoading
  } = useEdgeFunction(
    'brief-operations',
    { action: 'get_brief', brief_id: briefId },
    { method: 'POST' }
  );

  // Loading state
  if (briefLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-hypsights-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{t('brief.simplified.loading', 'Loading brief...')}</p>
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
            <h1 className="text-2xl font-bold mb-2">{briefData?.brief?.title || t('brief.simplified.title_loading', 'Brief loading')}</h1>
            <p className="text-gray-600 mb-3">{briefData?.brief?.description || t('brief.simplified.no_description', 'No description')}</p>
            
            {/* Tags section */}
            <div className="flex flex-wrap gap-2 text-sm mb-3">
              {/* Status */}
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {briefData?.brief?.status === 'draft' ? t('brief.status.draft', 'Draft') : t('brief.status.active', 'Active')}
              </span>
              
              {/* Locale */}
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {briefData?.brief?.default_locale === 'fr' ? t('brief.simplified.locale.fr', '🇫🇷 French') : t('brief.simplified.locale.en', '🇬🇧 English')}
              </span>

              {/* Visuel uniquement */}
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {t('brief.simplified.visual_mode_only', 'Visual mode only')}
              </span>
            </div>
            
            {/* Capabilities */}
            {briefData?.brief?.capabilities && briefData.brief.capabilities.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('brief.simplified.section.capabilities', 'Capabilities sought:')}</h3>
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
                <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('brief.simplified.section.maturity', 'Maturity:')}</h3>
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
                <h3 className="text-sm font-semibold text-gray-600 mb-1">{t('brief.simplified.section.geographies', 'Geographies:')}</h3>
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


          {/* Enhanced Chat View avec solutions */}
          <EnhancedChatView 
            briefId={briefId || 'unknown'}
            onSolutionValidated={(solutionId) => {
              console.log('Solution validée:', solutionId);
              // Si besoin de mettre à jour le statut du brief, on peut le faire ici
            }}
            onMessageSent={() => {
              console.log('Message envoyé');
            }}
          />
          
          {/* Panneau de fournisseurs séparé */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">{t('brief.simplified.suppliers', 'Suppliers')}</h2>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <SuppliersPanel briefId={briefId || 'unknown'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedBriefPage;
