import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from './ChatInterface';
import { supabase } from '../../lib/supabaseClient';

/**
 * Formate le contenu d'un message en nettoyant les caractères d'échappement JSON
 * et en convertissant le markdown basique en HTML
 */
const formatMessageContent = (content: string): string => {
  if (!content) return '';
  
  // Nettoyer les caractères d'échappement JSON
  let formatted = content
    .replace(/\\n/g, '\n')  // Convertir \n en vrais sauts de ligne
    .replace(/\\"/g, '"')   // Convertir \" en guillemets
    .replace(/\\'/g, "'");   // Convertir \' en apostrophes
  
  // Supprimer le préfixe "text:" si présent
  formatted = formatted.replace(/^text:\s*/, '');
  
  return formatted;
};

/**
 * Composant pour afficher le contenu formaté d'un message avec support markdown basique
 */
const FormattedMessageContent: React.FC<{ content: string }> = ({ content }) => {
  const formatted = formatMessageContent(content);
  
  // Diviser en lignes pour le rendu
  const lines = formatted.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Ligne vide
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }
        
        // Titre en gras (commence par **)
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
          const text = line.trim().slice(2, -2);
          return (
            <div key={index} className="font-bold text-gray-900">
              {text}
            </div>
          );
        }
        
        // Liste à puces (commence par - ou •)
        if (line.trim().match(/^[-•]\s/)) {
          const text = line.trim().slice(2);
          // Gérer le texte en gras dans les listes
          const parts = text.split(/\*\*(.*?)\*\*/);
          return (
            <div key={index} className="flex gap-2">
              <span className="text-gray-600">•</span>
              <span className="flex-1">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </span>
            </div>
          );
        }
        
        // Flèche de conclusion (→)
        if (line.trim().startsWith('→')) {
          const text = line.trim().slice(1).trim();
          const parts = text.split(/\*\*(.*?)\*\*/);
          return (
            <div key={index} className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-blue-600 font-bold">→</span>
              <span className="flex-1 font-medium text-blue-900">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </span>
            </div>
          );
        }
        
        // Texte normal avec support du gras inline
        const parts = line.split(/\*\*(.*?)\*\*/);
        return (
          <div key={index}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Utiliser un nom de channel simple et constant
const REALTIME_CHANNEL_NAME = 'chat_messages';

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Référence pour faire défiler vers le bas automatiquement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour charger les messages directement via supabase.functions.invoke
  const loadMessages = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoadError(null);
    console.log('DEBUG SimplifiedChatView - Loading messages for briefId:', briefId);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
        body: {
          action: 'get_chat_messages',
          brief_id: briefId
        }
      });
      
      if (error) {
        console.error('DEBUG SimplifiedChatView - Error loading messages:', error);
        setLoadError(`Erreur: ${error.message || 'Impossible de charger les messages'}`);
        return;
      }
      
      // Logs pour examiner la structure exacte de la réponse
      console.log('=== RAW DATA STRUCTURE ===');
      console.log('data:', JSON.stringify(data, null, 2));
      console.log('data.data:', data.data);
      console.log('data.data.messages:', data.data?.messages);
      
      // Vérifier différentes structures de données possibles
      if (data?.messages && Array.isArray(data.messages)) {
        console.log('DEBUG SimplifiedChatView - Successfully loaded messages (data.messages):', data.messages.length);
        setMessages(data.messages);
      } else if (data?.data?.messages && Array.isArray(data.data.messages)) {
        console.log('DEBUG SimplifiedChatView - Successfully loaded messages (data.data.messages):', data.data.messages.length);
        setMessages(data.data.messages);
      } else {
        console.warn('DEBUG SimplifiedChatView - Invalid response format:', data);
        setLoadError('Format de réponse invalide');
      }
      
    } catch (err) {
      console.error('DEBUG SimplifiedChatView - Exception during message loading:', err);
      setLoadError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId, isLoading]);
  
  // Charger les messages uniquement au montage initial du composant
  // ⚠️ IMPORTANT: Désactivé la dépendance [briefId, loadMessages] qui causait une boucle infinie
  useEffect(() => {
    console.log('DEBUG SimplifiedChatView - Component mounted, initial message load');
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Dépendance vide pour exécuter une seule fois
  
  // Scroll automatique vers le bas lorsque les messages changent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // REAL-TIME SUBSCRIPTION simplifiée - écoute tous les événements (*)
  useEffect(() => {
    console.log('DEBUG SimplifiedChatView - Setting up realtime subscription for brief_id:', briefId);
    
    const channel = supabase
      .channel(REALTIME_CHANNEL_NAME)
      .on('postgres_changes', {
        event: '*', // Écoute tous les événements (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('DEBUG SimplifiedChatView - REALTIME EVENT RECEIVED:', {
          eventType: payload.eventType,
          table: payload.table,
          schema: payload.schema,
          newRecord: payload.new,
          oldRecord: payload.old
        });
        
        // Ne traiter que les nouveaux messages (INSERT ou UPDATE)
        if (!payload.new) {
          console.log('DEBUG SimplifiedChatView - No new data in payload, ignoring');
          return;
        }
        
        const newMessage = payload.new as ChatMessage;
        console.log('DEBUG SimplifiedChatView - Processing message:', {
          id: newMessage.id,
          is_ai: newMessage.is_ai,
          content_preview: newMessage.content?.substring(0, 50) + '...',
        });
        
        setMessages(prev => {
          // Vérifier si le message existe déjà par ID
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('DEBUG SimplifiedChatView - Duplicate message detected, ignoring');
            return prev;
          }
          console.log('DEBUG SimplifiedChatView - Adding new message to state, now total:', prev.length + 1);
          return [...prev, newMessage];
        });
      })
      .subscribe((status) => {
        console.log('DEBUG SimplifiedChatView - Subscription status:', status);
      });

    return () => {
      console.log('DEBUG SimplifiedChatView - Unsubscribing from realtime channel');
      supabase.removeChannel(channel);
    };
  }, [briefId]);
  
  // Fonction de test pour vérifier la subscription real-time
  const testRealtimeSubscription = useCallback(async () => {
    console.log('DEBUG SimplifiedChatView - Testing realtime subscription...');
    try {
      // Récupérer la liste actuelle des channels
      const channels = supabase.getChannels();
      console.log('DEBUG SimplifiedChatView - Active channels:', channels.map(c => ({ 
        name: c.name, 
        state: c.state,
        topic: c._topic
      })));
      
      // Tester si on peut insérer un message de test directement
      // Ceci n'est qu'un diagnostic, en production il faut passer par l'Edge Function
      console.log('DEBUG SimplifiedChatView - Testing direct message insert...');
      const testContent = `Test message ${Date.now()}`;
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      // Insertion test via Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
        body: {
          action: 'send_message',
          brief_id: briefId,
          message_content: testContent
        }
      });
      
      console.log('DEBUG SimplifiedChatView - Test message result:', { data, error });
      
    } catch (error) {
      console.error('DEBUG SimplifiedChatView - Realtime test error:', error);
    }
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat-handler`, {
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
    aiMessage: "mr-auto max-w-[80%] bg-gray-100 text-gray-800 p-4 rounded-lg",
    inputArea: "border-t border-gray-200 p-4",
    input: "w-full border border-gray-300 rounded-md p-2",
    sendButton: "bg-primary text-primary-foreground px-4 py-2 rounded-md ml-2"
  };
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assistant IA</h3>
        <div className="flex gap-2">
          {/* Bouton de refresh */}
          <button 
            onClick={loadMessages}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md hover:bg-blue-200 disabled:opacity-50"
            title="Rafraîchir les messages"
          >
            {isLoading ? 'Chargement...' : 'Rafraîchir'}
          </button>
          {/* Bouton pour tester l'abonnement real-time */}
          <button 
            onClick={testRealtimeSubscription}
            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-md hover:bg-green-200"
          >
            Test RT
          </button>
          {/* Bouton temporaire pour tester l'Edge Function */}
          <button 
            onClick={testEdgeFunction}
            className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-md hover:bg-gray-300"
          >
            Test API
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {isLoading && messages.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement des messages...
          </div>
        )}
        {loadError && (
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-md m-4">
            <p className="text-sm">{loadError}</p>
            <button
              onClick={loadMessages}
              className="mt-2 text-xs bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
            >
              Réessayer
            </button>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.is_ai ? styles.aiMessage : styles.userMessage}
          >
            <div className="text-sm">
              {message.is_ai ? (
                <FormattedMessageContent content={message.content} />
              ) : (
                message.content
              )}
            </div>
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
