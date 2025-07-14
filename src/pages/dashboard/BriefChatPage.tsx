import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import EnhancedChatView from '../../components/chat/EnhancedChatView';
import { SuppliersPanel } from '../../components/chat/SuppliersPanel';
import BriefHeader, { BriefHeaderSkeleton } from '../../components/briefs/BriefHeader';
import { useI18n } from '../../contexts/I18nContext';
import { useBriefHeaderData } from '../../hooks/useBriefHeaderData';

const BriefChatPage = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const { headerData, isHeaderLoading, headerError, refreshHeaderData } = useBriefHeaderData(briefId);

  const handleSolutionValidated = async (solutionId: string) => {
    if (headerData?.brief.status === 'draft' && briefId) {
      try {
        await supabase.from('briefs').update({ status: 'active' }).eq('id', briefId);
        refreshHeaderData(); // Re-fetch data to get the new status

        // Call N8N webhook
        const webhookPayload = {
          brief_id: briefId,
          user_id: headerData.brief.user_id, // Assuming user_id is part of brief data
          brief: headerData.brief,
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID()
        };
        await fetch('https://n8n.proxiwave.com/webhook/brief_initialisation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        });
      } catch (error) {
        console.error('Error updating brief status or calling webhook:', error);
      }
    }
  };

  const handleMessageSent = () => {
    // Potentially refresh some data here in the future
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8 h-screen flex flex-col">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('brief.chat.button.back_to_dashboard', 'Back to Dashboard')}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {isHeaderLoading ? (
            <BriefHeaderSkeleton />
          ) : headerError ? (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl shadow-lg">
              <p>{headerError}</p>
            </div>
          ) : headerData ? (
            <>
              <BriefHeader 
                brief={headerData.brief}
                kpis={headerData.kpis}
                structuredFilters={headerData.structured_filters}
                referenceCompanies={headerData.reference_companies}
              />
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <EnhancedChatView 
                  briefId={briefId!}
                  onSolutionValidated={handleSolutionValidated}
                  onMessageSent={handleMessageSent}
                />
              </div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold">{t('brief.chat.suppliers', 'Suppliers')}</h2>
                </div>
                <SuppliersPanel briefId={briefId!} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BriefChatPage;
