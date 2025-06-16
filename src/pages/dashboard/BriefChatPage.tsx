import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import EnhancedChatView from '../../components/chat/EnhancedChatView';
import { useI18n } from '../../contexts/I18nContext';

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
  
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les détails du brief
  useEffect(() => {
    if (!briefId) {
      setError(t('brief.chat.error.missing_id', 'Missing brief identifier'));
      setLoading(false);
      return;
    }
    
    const loadBrief = async () => {
      try {
        console.log('DEBUG BriefChatPage - Loading brief details for ID:', briefId);
        
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', briefId)
          .single();
        
        if (error) {
          console.error('DEBUG BriefChatPage - Error loading brief:', error);
          setError(t('brief.chat.error.load_failed_detail', 'Error loading brief: {message}', { message: error.message }));
          return;
        }
        
        if (!data) {
          console.error('DEBUG BriefChatPage - Brief not found');
          setError(t('brief.chat.error.not_found', 'Brief not found'));
          return;
        }
        
        console.log('DEBUG BriefChatPage - Brief loaded:', data);
        setBrief(data);
      } catch (error) {
        console.error('DEBUG BriefChatPage - Exception loading brief:', error);
        setError(t('brief.chat.error.generic_detail', 'An error occurred: {message}', { message: (error as Error).message }));
      } finally {
        setLoading(false);
      }
    };
    
    loadBrief();
  }, [briefId]);
  
  // Gérer la validation d'une solution
  const handleSolutionValidated = async (solutionId: string) => {
    console.log('DEBUG BriefChatPage - Solution validated:', solutionId);
    
    // Si le brief était en statut "draft", le passer en "active"
    if (brief && brief.status === 'draft') {
      try {
        console.log('DEBUG BriefChatPage - Updating brief status from draft to active');
        
        const { error } = await supabase
          .from('briefs')
          .update({ status: 'active' })
          .eq('id', brief.id);
        
        if (error) {
          console.error('DEBUG BriefChatPage - Error updating brief status:', error);
          return;
        }
        
        // Mettre à jour l'état local
        setBrief(prev => prev ? { ...prev, status: 'active' } : null);
        console.log('DEBUG BriefChatPage - Brief status updated to active');
        
        // Appeler directement le webhook N8N pour l'initialisation du brief
        try {
          console.log('DEBUG BriefChatPage - Calling brief initialization webhook');
          const webhookPayload = {
            brief_id: brief.id,
            user_id: brief.user_id,
            brief: brief,
            timestamp: new Date().toISOString(),
            request_id: crypto.randomUUID()
          };
          
          const webhookResponse = await fetch('https://n8n.proxiwave.com/webhook/brief_initialisation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
          });
          
          if (!webhookResponse.ok) {
            throw new Error(`Webhook returned status ${webhookResponse.status}`);
          }
          
          const webhookResult = await webhookResponse.json();
          console.log('DEBUG BriefChatPage - Webhook response:', webhookResult);
        } catch (webhookError) {
          console.error('DEBUG BriefChatPage - Error calling brief initialization webhook:', webhookError);
          // Ne pas bloquer le flux si l'appel webhook échoue
        }
      } catch (error) {
        console.error('DEBUG BriefChatPage - Exception updating brief status:', error);
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
