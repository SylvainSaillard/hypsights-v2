import { useParams, useNavigate } from 'react-router-dom';
import { useEdgeFunction } from '../../hooks/useEdgeFunction';
import EnhancedChatView from '../../components/chat/EnhancedChatView';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabaseClient'; // Import supabase

interface Brief {
  id: string;
  title: string;
  status: string;
  created_at: string;
  user_id: string;
}

const BriefChatPage = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const { data, loading, error, refresh } = useEdgeFunction('brief-operations', {
    action: 'get_brief',
    brief_id: briefId,
  });

  const brief = data?.brief as Brief | null;

  
  // Gérer la validation d'une solution
  const handleSolutionValidated = async (solutionId: string) => {
    console.log('DEBUG BriefChatPage - Solution validated:', solutionId);

    if (brief && brief.status === 'draft') {
      try {
        console.log('DEBUG BriefChatPage - Updating brief status from draft to active');
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brief-operations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'update_brief',
            brief_id: brief.id,
            brief_data: { status: 'active' },
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update brief status');
        }

        console.log('DEBUG BriefChatPage - Brief status updated to active');
        refresh(); // Re-fetch brief data to update the UI

      } catch (error) {
        console.error('DEBUG BriefChatPage - Exception updating brief status:', error);
        // Optionally, show an error to the user
      }
    }
  };
  
  // Gérer l'envoi d'un message
  const handleMessageSent = () => {
    console.log('DEBUG BriefChatPage - Message sent');
    // Aucune action supplémentaire nécessaire pour le moment
  };
  
  return (
    <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t('brief.chat.button.back_to_dashboard', 'Back to Dashboard')}
            </button>
            
            <h1 className="text-2xl font-bold">
              {loading ? t('brief.chat.header.loading', 'Loading...') : brief ? brief.title : t('brief.chat.error.not_found', 'Brief not found')}
            </h1>
            
            {brief && (
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  brief.status === 'draft' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {brief.status === 'draft' ? t('brief.status.draft', 'Draft') : t('brief.status.active', 'Active')}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {t('brief.chat.created_on_prefix', 'Created on ')} {new Date(brief.created_at).toLocaleDateString(locale)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          <div className="font-semibold">{t('brief.chat.error.display_title', 'Error')}</div>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-2 text-red-700 underline"
          >
            {t('brief.chat.button.back_to_dashboard', 'Back to Dashboard')}
          </button>
        </div>
      )}
      
      {/* Contenu principal */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : brief && !error ? (
        <div className="flex-1">
          <EnhancedChatView 
            briefId={brief.id}
            onSolutionValidated={handleSolutionValidated}
            onMessageSent={handleMessageSent}
          />
        </div>
      ) : null}
    </div>
  );
};

export default BriefChatPage;
