import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import EnhancedChatView from '../../components/chat/EnhancedChatView';
import { SuppliersPanel } from '../../components/chat/SuppliersPanel';

import BriefHeader, { BriefHeaderSkeleton } from '../../components/briefs/BriefHeader';
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
  const { t } = useI18n();
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8 h-screen flex flex-col">
        {/* Header Section */}
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

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold text-lg">{t('brief.chat.error.display_title', 'Error')}</div>
                  <p className="mt-1">{error}</p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('brief.chat.button.back_to_dashboard', 'Back to Dashboard')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading or Content Display */}
        {loading ? (
          <BriefHeaderSkeleton />
        ) : brief && !error ? (
          <div className="flex-1 flex flex-col gap-6">
            <BriefHeader briefId={brief.id} />

            {/* Chat et Solutions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <EnhancedChatView 
                briefId={brief.id}
                onSolutionValidated={handleSolutionValidated}
                onMessageSent={handleMessageSent}
              />
            </div>
            
            {/* Panneau de fournisseurs séparé */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold">{t('brief.chat.suppliers', 'Suppliers')}</h2>
              </div>
              <SuppliersPanel briefId={brief.id} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BriefChatPage;
