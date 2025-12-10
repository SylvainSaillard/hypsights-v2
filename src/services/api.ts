import { supabase } from '../lib/supabaseClient';
import type { ChatMessage } from '../components/chat/ChatInterface';
import type { Solution } from '../components/chat/types';

/**
 * Service API pour les appels aux Edge Functions
 * Centralise tous les appels API pour éviter la duplication et assurer la cohérence
 */
export const api = {
  /**
   * Récupère les messages de chat pour un brief donné
   */
  getChatMessages: async (briefId: string): Promise<ChatMessage[]> => {
    console.log('API - Loading messages for briefId:', briefId);
    
    const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
      body: {
        action: 'get_chat_messages',
        brief_id: briefId
      }
    });
    
    if (error) {
      console.error('API - Error loading messages:', error);
      throw new Error(error.message || 'Impossible de charger les messages');
    }
    
    console.log('API - Raw messages response:', data);
    
    // Gestion des différentes structures de réponse possibles
    if (data?.success === true && Array.isArray(data.data?.chatMessages)) {
      // Format {success: true, data: {chatMessages: Array<ChatMessage>}}
      return data.data.chatMessages;
    } else if (data?.success === true && Array.isArray(data.data)) {
      // Format {success: true, data: Array<ChatMessage>}
      return data.data;
    } else if (data?.chatMessages && Array.isArray(data.chatMessages)) {
      // Format {chatMessages: Array<ChatMessage>}
      return data.chatMessages;
    } else if (data?.messages && Array.isArray(data.messages)) {
      // Format {messages: Array<ChatMessage>}
      return data.messages;
    } else if (Array.isArray(data)) {
      // Format Array<ChatMessage> directement
      return data;
    }
    
    console.warn('API - Unexpected messages format:', data);
    return [];
  },
  
  /**
   * Envoie un message dans le chat
   */
  sendMessage: async (briefId: string, message: string): Promise<any> => {
    console.log('API - Sending message for briefId:', briefId);
    
    const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
      body: {
        action: 'send_message',
        brief_id: briefId,
        message_content: message
      }
    });
    
    if (error) {
      console.error('API - Error sending message:', error);
      throw new Error(error.message || 'Impossible d\'envoyer le message');
    }
    
    return data;
  },
  
  /**
   * Récupère les solutions pour un brief donné
   */
  getSolutions: async (briefId: string): Promise<Solution[]> => {
    console.log('API - Loading solutions for briefId:', briefId);
    
    // Utiliser directement l'API de Supabase pour éviter les problèmes de CORS et de redirection
    const { data, error } = await supabase.functions.invoke('solution-handler', {
      body: {
        action: 'get_solutions',
        brief_id: briefId
      }
    });
    
    if (error) {
      console.error('API - Error loading solutions:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des solutions');
    }
    
    console.log('API - Raw solutions response:', data);
    
    // Vérifier la structure de la réponse et extraire le tableau de solutions
    if (data && typeof data === 'object') {
      if (data.success && Array.isArray(data.data)) {
        // Format {success: true, data: Array<Solution>}
        return data.data;
      } else if (Array.isArray(data)) {
        // Format Array<Solution> directement
        return data;
      }
    }
    
    console.warn('API - Unexpected solutions format:', data);
    return [];
  },
  
  /**
   * Valide une solution
   */
  validateSolution: async (solutionId: string): Promise<any> => {
    console.log('API - Validating solution:', solutionId);
    
    // Utiliser directement l'API de Supabase pour éviter les problèmes de CORS et de redirection
    const { data, error } = await supabase.functions.invoke('solution-handler', {
      body: {
        action: 'validate_solution',
        solution_id: solutionId
      }
    });
    
    if (error) {
      console.error('API - Error validating solution:', error);
      throw new Error(error.message || 'Erreur lors de la validation de la solution');
    }
    
    return data;
  },
  
  /**
   * Accès direct au client Supabase pour les abonnements real-time
   */
  supabase
};

export default api;
