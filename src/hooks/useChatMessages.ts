import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../components/chat/ChatInterface';
import api from '../services/api';

/**
 * Hook pour gérer les messages de chat
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Optimisé pour gérer les réponses du workflow n8n
 */
export function useChatMessages(briefId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  
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
      
      // Marquer le moment où le message a été envoyé
      const now = Date.now();
      setLastSentAt(now);
      
      // Recharger immédiatement pour voir au moins notre propre message
      await loadMessages();
      
    } catch (err) {
      console.error('useChatMessages - Error sending message:', err);
      setError(`Erreur: ${(err as Error).message || 'Erreur inconnue'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  // Effet pour vérifier les nouveaux messages après l'envoi d'un message
  // Ceci est spécifiquement pour gérer le délai du workflow n8n
  useEffect(() => {
    if (!lastSentAt || !briefId) return;
    
    console.log('useChatMessages - Setting up post-send message checks');
    
    // Vérifier les nouveaux messages après un court délai (3s, 6s, 12s)
    // pour capturer la réponse du workflow n8n
    const checkTimes = [3000, 6000, 12000];
    
    const timeouts = checkTimes.map(delay => {
      return setTimeout(() => {
        console.log(`useChatMessages - Checking for n8n response after ${delay}ms`);
        loadMessages();
      }, delay);
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [lastSentAt, briefId, loadMessages]);
  
  // Effet pour configurer l'abonnement real-time aux messages
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useChatMessages - Setting up realtime subscription for briefId:', briefId);
    
    // Abonnement aux messages de chat via Realtime
    const chatChannel = api.supabase
      .channel(`chat_messages_${briefId}`)
      .on('postgres_changes', {
        event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('useChatMessages - Chat message event via realtime:', payload);
        
        // Au lieu de gérer les messages individuellement, recharger tous les messages
        // C'est plus fiable avec le workflow n8n qui peut créer plusieurs messages
        loadMessages();
      })
      .subscribe((status) => {
        console.log('useChatMessages - Chat subscription status:', status);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('useChatMessages - Subscription issue, reloading messages');
          loadMessages();
        }
      });
    
    // Charger les messages au montage
    loadMessages();
    
    // Configurer un intervalle de rafraîchissement comme filet de sécurité
    // Ceci est crucial pour les cas où le workflow n8n prend du temps
    const refreshInterval = setInterval(() => {
      console.log('useChatMessages - Periodic refresh check');
      loadMessages();
    }, 5000); // Rafraîchir toutes les 5 secondes comme filet de sécurité
    
    // Nettoyage de l'abonnement et de l'intervalle
    return () => {
      console.log('useChatMessages - Cleaning up subscription and interval');
      clearInterval(refreshInterval);
      api.supabase.removeChannel(chatChannel);
    };
  }, [briefId, loadMessages]);
  
  return {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    loadMessages
  };
}
