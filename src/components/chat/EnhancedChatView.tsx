import React, { useState, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import { startFastSearchFromSolution } from '../../services/fastSearchService';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
import type { EnhancedChatViewProps } from './types';

/**
 * Composant de chat amélioré avec affichage des solutions et des fournisseurs
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Version simplifiée avec SuppliersPanel
 */
const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({
  briefId,
  onMessageSent,
  onSolutionValidated
}) => {
  // États locaux
  const [inputValue, setInputValue] = useState('');
  const [fastSearchQuota, setFastSearchQuota] = useState({ used: 0, total: 3 });
  const [startingSolutionId, setStartingSolutionId] = useState<string | null>(null);
  
  // Utilisation des hooks personnalisés pour la logique métier
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    isSending,
    sendMessage,
    loadMessages
  } = useChatMessages(briefId);
  
  const {
    solutions,
    isLoading: isLoadingSolutions,
    error: solutionsError,
    loadSolutions,
    validateSolution
  } = useSolutions(briefId, onSolutionValidated);
  
  // Charger le quota de Fast Search depuis le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/functions/v1/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_user_profile' })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.user) {
          setFastSearchQuota({
            used: data.data.user.fast_search_used || 0,
            total: data.data.user.fast_search_quota || 3
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Gestionnaire d'envoi de message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    
    await sendMessage(messageText);
    
    // Notifier le parent que le message a été envoyé
    if (onMessageSent) {
      onMessageSent();
    }
  };
  
  // Gestionnaire de lancement de Fast Search depuis une solution spécifique
  const handleStartFastSearchFromSolution = async (solutionId: string) => {
    if (fastSearchQuota.used >= fastSearchQuota.total) {
      return;
    }
    
    try {
      // Suivre quelle solution spécifique est en cours de chargement
      setStartingSolutionId(solutionId);
      
      // Appeler l'Edge Function pour lancer la recherche avec une solution spécifique
      const result = await startFastSearchFromSolution(briefId, solutionId);
      
      // Mettre à jour le quota
      if (result.quota) {
        setFastSearchQuota({
          used: result.quota.used,
          total: result.quota.total
        });
      } else {
        // Fallback si le quota n'est pas retourné
        setFastSearchQuota(prev => ({ ...prev, used: prev.used + 1 }));
      }
      
      // Recharger les solutions pour mettre à jour les dates fast_search_launched_at
      loadSolutions();
      
    } catch (error) {
      console.error('Failed to launch Fast Search from solution:', error);
    } finally {
      // Réinitialiser l'état de chargement
      setStartingSolutionId(null);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Conteneur principal avec hauteur fixe */}
      <div className="flex gap-6 h-[600px] w-full">
        {/* Panneau de chat avec hauteur fixe et défilement */}
        <div className="w-3/5 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <ChatPanel
              messages={messages}
              isLoading={isLoadingMessages}
              error={messagesError}
              inputValue={inputValue}
              isSending={isSending}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onRefresh={loadMessages}
            />
          </div>
        </div>
        
        {/* Panneau de solutions */}
        <div className="w-2/5 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <SolutionsPanel
              solutions={solutions}
              isLoading={isLoadingSolutions}
              error={solutionsError}
              onValidate={validateSolution}
              onRefresh={loadSolutions}
              onStartFastSearch={handleStartFastSearchFromSolution}
              startingSolutionId={startingSolutionId}
              briefHasActiveSearch={true}
              showFastSearchDirectly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatView;
