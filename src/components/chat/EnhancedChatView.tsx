import React, { useState, useEffect } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
import FastSearchBar from './FastSearchBar';
import type { EnhancedChatViewProps } from './types';

/**
 * Composant de chat amélioré avec affichage des solutions
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Version refactorisée avec séparation des responsabilités
 */
const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({
  briefId,
  onMessageSent,
  onSolutionValidated
}) => {
  // États locaux
  const [inputValue, setInputValue] = useState('');
  const [fastSearchQuota, setFastSearchQuota] = useState({ used: 0, total: 3 });
  const [isReadyForSearch, setIsReadyForSearch] = useState(false);
  
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
  
  // Vérifier si des solutions ont été validées
  useEffect(() => {
    const hasValidatedSolutions = solutions.some(solution => solution.status === 'validated');
    setIsReadyForSearch(hasValidatedSolutions);
    
    // Charger le quota de Fast Search (à implémenter avec une API réelle)
    // Pour l'instant, on utilise des valeurs statiques
    setFastSearchQuota({ used: 1, total: 3 });
  }, [solutions]);
  
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
  
  // Gestionnaire de lancement de Fast Search
  const handleLaunchFastSearch = async () => {
    // À implémenter: appel à l'Edge Function pour lancer une Fast Search
    console.log('Launching Fast Search for brief:', briefId);
    
    // Simuler la mise à jour du quota
    setFastSearchQuota(prev => ({ ...prev, used: prev.used + 1 }));
    
    // Ici, vous appelleriez votre Edge Function
    // await api.launchFastSearch(briefId);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Barre Fast Search (visible uniquement quand des solutions sont validées) */}
      <FastSearchBar 
        isReady={isReadyForSearch}
        quotaUsed={fastSearchQuota.used}
        quotaTotal={fastSearchQuota.total}
        onLaunchSearch={handleLaunchFastSearch}
      />
      
      {/* Conteneur principal avec hauteur fixe */}
      <div className="flex gap-4 h-[600px]">
        {/* Panneau de chat avec hauteur fixe et défilement */}
        <div className="w-3/5 flex flex-col">
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
        
        {/* Panneau de solutions */}
        <SolutionsPanel
          solutions={solutions}
          isLoading={isLoadingSolutions}
          error={solutionsError}
          onValidate={validateSolution}
          onRefresh={loadSolutions}
        />
      </div>
    </div>
  );
};

export default EnhancedChatView;
