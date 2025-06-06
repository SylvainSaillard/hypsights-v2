import React, { useState } from 'react';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSolutions } from '../../hooks/useSolutions';
import ChatPanel from './ChatPanel';
import SolutionsPanel from './SolutionsPanel';
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
  // État local pour le champ de saisie
  const [inputValue, setInputValue] = useState('');
  
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
  
  return (
    <div className="flex h-full gap-4">
      {/* Panneau de chat */}
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
      
      {/* Panneau de solutions */}
      <SolutionsPanel
        solutions={solutions}
        isLoading={isLoadingSolutions}
        error={solutionsError}
        onValidate={validateSolution}
        onRefresh={loadSolutions}
      />
    </div>
  );
};

export default EnhancedChatView;
