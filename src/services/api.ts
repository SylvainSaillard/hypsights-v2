import { createClient } from '@supabase/supabase-js';
import type { ChatMessage } from '../components/chat/ChatInterface';
import type { Solution } from '../components/chat/types';

// Initialisation du client Supabase pour les appels authentifiés
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    
    // Vérifier différentes structures de données possibles
    if (data?.messages && Array.isArray(data.messages)) {
      return data.messages;
    } else if (data?.data?.messages && Array.isArray(data.data.messages)) {
      return data.data.messages;
    } else {
      console.warn('API - Invalid response format:', data);
      throw new Error('Format de réponse invalide');
    }
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
        message
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
    
    return data || [];
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
