import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from './ChatInterface';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase pour les appels authentifiés
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Constante pour le nom du channel avec timestamp unique pour éviter les conflits
const REALTIME_CHANNEL_PREFIX = 'chat_messages_';

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
  
  // Log pour debugging
  useEffect(() => {
    console.log('DEBUG SimplifiedChatView - Status:', {
      briefId, 
      loading, 
      hasData: !!data, 
      messagesCount: data?.messages?.length || 0,
      error
    });
  }, [briefId, data, loading, error]);
  
  // Synchronisation des messages depuis la réponse de l'API
  useEffect(() => {
    if (data?.messages) {
      console.log('DEBUG SimplifiedChatView - Received messages:', data.messages.length);
      setMessages(data.messages);
    }
  }, [data]);
  
  // Force refresh when briefId changes
  useEffect(() => {
    console.log('DEBUG SimplifiedChatView - Brief ID changed, forcing refresh');
    refresh();
  }, [briefId, refresh]);
  
  // Scroll automatique vers le bas lorsque les messages changent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // REAL-TIME SUBSCRIPTION avec nom unique pour éviter les conflits
  useEffect(() => {
    // Canal unique par instance et briefId
    const channelName = `${REALTIME_CHANNEL_PREFIX}${briefId}_${Date.now()}`;
    console.log('DEBUG SimplifiedChatView - Creating realtime channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('DEBUG SimplifiedChatView - Realtime message received:', payload.new);
        
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          // Vérifier si le message existe déjà par ID
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('DEBUG SimplifiedChatView - Duplicate message detected, ignoring');
            return prev;
          }
          console.log('DEBUG SimplifiedChatView - Adding new message to state');
          return [...prev, newMessage];
        });
      })
      .subscribe((status) => {
        console.log('DEBUG SimplifiedChatView - Subscription status:', status);
      });

    return () => {
      console.log('DEBUG SimplifiedChatView - Removing channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [briefId]);
  
  // Fonction de test pour l'Edge Function avec authentification
  const testEdgeFunction = useCallback(async () => {
    console.log('DEBUG TEST - Testing Edge Function directly');
    try {
      // Récupérer explicitement la session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('DEBUG TEST - No active session found');
        return;
      }
      
      console.log('DEBUG TEST - User session:', { 
        userId: session.user.id,
        email: session.user.email,
        hasToken: !!session.access_token
      });
      
      // Appel direct avec token explicite
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'get_chat_messages',
          brief_id: briefId
        })
      });
      
      const data = await response.json();
      console.log('DEBUG TEST - Direct API response:', data);
      
      // Test avec client supabase
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'ai-chat-handler',
        {
          body: {
            action: 'get_chat_messages',
            brief_id: briefId
          }
        }
      );
      
      console.log('DEBUG TEST - Client invoke response:', { data: functionData, error: functionError });
      
    } catch (error) {
      console.error('DEBUG TEST - Test failed:', error);
    }
  }, [briefId]);
  
  // Fonction pour envoyer un message (déclenche webhook N8n)
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const tempId = `temp-${Date.now()}`;
    console.log('DEBUG SimplifiedChatView - Sending message with temp ID:', tempId);
    
    const userMessage: ChatMessage = {
      id: tempId,
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
    
    // Scroll vers le bas immédiatement après ajout du message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      console.log('DEBUG SimplifiedChatView - Calling Edge Function ai-chat-handler');
      // 2. Appel Edge Function (qui déclenche webhook N8n) via client Supabase
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('ai-chat-handler', {
        body: { 
          action: 'send_message', 
          brief_id: briefId, 
          message_content: userMessage.content 
        }
      });

      if (invokeError) {
        console.error('DEBUG SimplifiedChatView - Edge Function error:', invokeError);
        throw new Error(`Send failed: ${invokeError.message}`);
      }
      
      console.log('DEBUG SimplifiedChatView - Message sent successfully, response:', responseData);

      // 3. PAS DE REFRESH - La réponse IA arrivera via real-time
      // Le webhook N8n va insérer la réponse dans la table
      // Le composant l'affichera automatiquement via subscription

      onMessageSent?.();

    } catch (error) {
      // 4. Rollback en cas d'erreur
      console.error('DEBUG SimplifiedChatView - Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
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
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assistant IA</h3>
        {/* Bouton temporaire pour tester l'Edge Function */}
        <button 
          onClick={testEdgeFunction}
          className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-md hover:bg-gray-300"
        >
          Test API
        </button>
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
