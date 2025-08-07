import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../components/chat/ChatInterface';
import api from '../services/api';

/**
 * Hook pour gérer les messages de chat
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
export function useChatMessages(briefId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Fonction pour charger les messages de chat
  const loadMessages = useCallback(async () => {
    if (!briefId) {
      console.log('useChatMessages - No briefId provided, skipping message load');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = await api.getChatMessages(briefId);
      console.log('useChatMessages - Successfully loaded messages:', messages.length);
      setMessages(messages);
    } catch (err) {
      console.error('useChatMessages - Error loading messages:', err);
      setError(`Erreur: ${(err as Error).message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);
  
  // Fonction pour envoyer un message
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      await api.sendMessage(briefId, messageText);
      console.log('useChatMessages - Message sent successfully');
      // Le message sera ajouté via l'abonnement real-time
    } catch (err) {
      console.error('useChatMessages - Error sending message:', err);
      setError(`Erreur: ${(err as Error).message || 'Erreur inconnue'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  // Effet pour configurer l'abonnement real-time aux messages
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useChatMessages - Setting up realtime subscription for briefId:', briefId);
    
    // Abonnement aux messages de chat
    const chatChannel = api.supabase
      .channel(`chat_messages_${briefId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('useChatMessages - New chat message received:', payload);
        
        // Vérifier si le message existe déjà pour éviter les doublons
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) {
            console.log('useChatMessages - Duplicate message, ignoring:', newMessage.id);
            return prev;
          }
          return [...prev, newMessage];
        });
      })
      .subscribe((status) => {
        console.log('useChatMessages - Chat subscription status:', status);
      });
    
    // Charger les messages au montage
    loadMessages();
    
    // Nettoyage de l'abonnement
    return () => {
      console.log('useChatMessages - Cleaning up subscription');
      api.supabase.removeChannel(chatChannel);
    };
  }, [briefId]);
  
  return {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    loadMessages
  };
}
