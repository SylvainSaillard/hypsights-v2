import React, { useRef } from 'react';
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
  // Références pour faire défiler vers le bas automatiquement - DÉSACTIVÉ TEMPORAIREMENT
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scrolling désactivé pour tester si c'est la cause du problème d'affichage
  // useEffect(() => {
  //   // Code d'auto-scrolling désactivé
  // }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-blue-50 border-b flex-shrink-0">
        <h2 className="font-semibold text-lg">{t('chat_panel.title', 'AI Assistant Chat')}</h2>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            {isLoading ? t('chat_panel.button.refresh_loading', 'Loading...') : t('chat_panel.button.refresh', 'Refresh')}
          </button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
            {error}
            <button 
              onClick={onRefresh}
              className="ml-2 underline"
            >
              {t('chat_panel.button.retry', 'Retry')}
            </button>
          </div>
        )}
      </div>
      
      {/* Messages - flex-1 to take remaining space */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            {t('chat_panel.no_messages', 'No messages. Start the conversation!')}
          </div>
        )}
        
        {isLoading && messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            {t('chat_panel.loading_messages', 'Loading messages...')}
          </div>
        )}
        
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`p-4 rounded-lg max-w-[80%] ${
              !message.is_ai 
                ? 'bg-blue-100 ml-auto' 
                : 'bg-gray-100 mr-auto'
            }`}
          >
            <div className="font-semibold text-sm mb-1">
              {!message.is_ai ? t('chat_panel.user_name', 'You') : t('chat_panel.ai_name', 'AI Assistant')}
            </div>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {/* Élément invisible pour faire défiler vers le bas - toujours présent mais non utilisé */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Formulaire d'envoi - fixed at bottom */}
      <div className="p-4 border-t flex-shrink-0">
        <form onSubmit={onSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t('chat_panel.input.placeholder', 'Type your message...')}
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSending ? t('chat_panel.button.send_sending', 'Sending...') : t('chat_panel.button.send', 'Send')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
