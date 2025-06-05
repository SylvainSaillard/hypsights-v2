import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from './ChatInterface';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase pour les appels authentifiés
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SimplifiedChatViewProps {
  briefId: string;
  onMessageSent?: () => void;
}

/**
 * Composant de chat simplifié pour l'interaction avec l'IA dans le contexte d'un brief
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
const SimplifiedChatView: React.FC<SimplifiedChatViewProps> = ({
  briefId,
  onMessageSent
}) => {
  // États locaux
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Référence pour faire défiler vers le bas automatiquement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hook pour récupérer les messages existants
  const { 
    data, 
    loading, 
    error, 
    refresh 
  } = useEdgeFunction('ai-chat-handler', {
    action: 'get_chat_messages',
    brief_id: briefId
  });
  
  // Synchronisation des messages depuis la réponse de l'API
  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  }, [data]);
  
  // Scroll automatique vers le bas lorsque les messages changent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // REAL-TIME SUBSCRIPTION pour nouvelles réponses IA
  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          // Éviter les doublons
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [briefId]);
  
  // Fonction pour envoyer un message (déclenche webhook N8n)
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      brief_id: briefId,
      user_id: undefined, // Sera défini côté serveur
      content: inputValue.trim(),
      is_ai: false,
      created_at: new Date().toISOString()
    };

    // 1. Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // 2. Appel Edge Function (qui déclenche webhook N8n)
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/functions/v1/ai-chat-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'send_message',
          brief_id: briefId,
          content: userMessage.content
        })
      });

      if (!response.ok) throw new Error('Send failed');

      // 3. PAS DE REFRESH - La réponse IA arrivera via real-time
      // Le webhook N8n va insérer la réponse dans la table
      // Le composant l'affichera automatiquement via subscription

      onMessageSent?.();

    } catch (error) {
      // 4. Rollback en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [briefId, inputValue, isSending, onMessageSent]);
  
  // Styles Tailwind à utiliser selon le design system
  const styles = {
    container: "flex flex-col h-96 border border-gray-200 rounded-lg",
    messagesArea: "flex-1 overflow-y-auto p-4 space-y-3",
    userMessage: "ml-auto max-w-xs bg-primary text-primary-foreground p-3 rounded-lg",
    aiMessage: "mr-auto max-w-xs bg-gray-100 text-gray-800 p-3 rounded-lg",
    inputArea: "border-t border-gray-200 p-4",
    input: "w-full border border-gray-300 rounded-md p-2",
    sendButton: "bg-primary text-primary-foreground px-4 py-2 rounded-md ml-2"
  };
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Assistant IA</h3>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {loading && <div>Chargement des messages...</div>}
        {error && <div className="text-red-500">Erreur: {error}</div>}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.is_ai ? styles.aiMessage : styles.userMessage}
          >
            <div className="text-sm">{message.content}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tapez votre message..."
            className={styles.input}
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            className={styles.sendButton}
          >
            {isSending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedChatView;
