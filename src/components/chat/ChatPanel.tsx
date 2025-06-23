import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from './ChatInterface';
import { useI18n } from '../../contexts/I18nContext';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  inputValue: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onRefresh: () => void;
}

/**
 * Composant d'affichage du panneau de chat
 * Conforme au principe KISS - UI pure sans logique métier
 */
const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  error,
  inputValue,
  isSending,
  onInputChange,
  onSendMessage,
  onRefresh
}) => {
  const { t } = useI18n();
  // Références pour faire défiler vers le bas automatiquement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  
  // Effet pour faire défiler vers le bas uniquement dans certaines conditions
  useEffect(() => {
    // Ne rien faire si pas de nouveaux messages
    if (!messages.length) return;

    const container = messagesContainerRef.current;
    const isInitialLoad = previousMessagesLengthRef.current === 0;

    const shouldAutoScroll = () => {
      // Toujours défiler si c'est le premier chargement
      if (isInitialLoad) return true;

      // Défiler si de nouveaux messages sont ajoutés
      if (messages.length > previousMessagesLengthRef.current) {
        // Vérifier si l'utilisateur était déjà proche du bas avant l'ajout de nouveaux messages
        if (container) {
          // Si l'utilisateur est à moins de 100px du bas, considérer qu'il est au bas
          const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
          return isNearBottom;
        }
        return true;
      }

      // Ne pas défiler si c'est juste un rafraîchissement sans nouveaux messages
      return false;
    };

    // Défiler uniquement si nécessaire, en différant l'action pour attendre le rendu du navigateur
    if (shouldAutoScroll() && messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
        }
      }, 0);
    }

    // Mettre à jour la référence du nombre de messages après la logique de défilement
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header avec design moderne */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t('chat_panel.title', 'AI Assistant Chat')}
            </h2>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-white shadow-md border border-blue-200 text-blue-700 text-sm rounded-lg hover:bg-blue-50 hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? t('chat_panel.button.refresh_loading', 'Loading...') : t('chat_panel.button.refresh', 'Refresh')}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
              <button 
                onClick={onRefresh}
                className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                {t('chat_panel.button.retry', 'Retry')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages avec design amélioré */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[450px] bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">
              {t('chat_panel.no_messages', 'No messages. Start the conversation!')}
            </p>
            <p className="text-gray-400 text-sm">
              Ask me anything about your business needs
            </p>
          </div>
        )}
        
        {isLoading && messages.length === 0 && (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              {t('chat_panel.loading_messages', 'Loading messages...')}
            </p>
          </div>
        )}
        
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${!message.is_ai ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`flex items-start gap-3 max-w-[85%] ${!message.is_ai ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                !message.is_ai 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}>
                {!message.is_ai ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`rounded-2xl px-4 py-3 shadow-md ${
                !message.is_ai 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className={`font-semibold text-xs mb-2 ${
                  !message.is_ai ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {!message.is_ai ? t('chat_panel.user_name', 'You') : t('chat_panel.ai_name', 'AI Assistant')}
                </div>
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  !message.is_ai ? 'text-white' : 'text-gray-800'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  !message.is_ai ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Élément invisible pour faire défiler vers le bas */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulaire d'envoi avec design moderne */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <form onSubmit={onSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={t('chat_panel.input.placeholder', 'Type your message...')}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              disabled={isSending}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 font-semibold"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('chat_panel.button.send_sending', 'Sending...')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {t('chat_panel.button.send', 'Send')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
