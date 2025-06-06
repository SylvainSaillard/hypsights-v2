import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from './ChatInterface';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase pour les appels authentifiés
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Constantes pour les noms des channels real-time
const CHAT_CHANNEL_NAME = 'chat_messages';
const SOLUTIONS_CHANNEL_NAME = 'solutions';

// Interface pour les solutions
interface Solution {
  id: string;
  brief_id: string;
  title: string;
  description: string;
  ai_confidence: number;
  keywords: string[];
  status: 'proposed' | 'validated' | 'rejected';
  created_at: string;
  updated_at: string;
  metadata?: any;
  type?: string;
}

interface EnhancedChatViewProps {
  briefId: string;
  onMessageSent?: () => void;
  onSolutionValidated?: (solutionId: string) => void;
}

/**
 * Composant de chat amélioré avec affichage des solutions
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
const EnhancedChatView: React.FC<EnhancedChatViewProps> = ({
  briefId,
  onMessageSent,
  onSolutionValidated
}) => {
  // États pour les messages de chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // États pour les solutions
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [solutionsError, setSolutionsError] = useState<string | null>(null);
  
  // Référence pour faire défiler vers le bas automatiquement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour charger les messages de chat
  const loadMessages = useCallback(async () => {
    if (!briefId) {
      console.log('DEBUG EnhancedChatView - No briefId provided, skipping message load');
      return;
    }
    
    setIsLoading(true);
    setLoadError(null);
    console.log('DEBUG EnhancedChatView - Loading messages for briefId:', briefId);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
        body: {
          action: 'get_chat_messages',
          brief_id: briefId
        }
      });
      
      if (error) {
        console.error('DEBUG EnhancedChatView - Error loading messages:', error);
        setLoadError(`Erreur: ${error.message || 'Impossible de charger les messages'}`);
        return;
      }
      
      // Logs pour examiner la structure exacte de la réponse
      console.log('=== RAW MESSAGES DATA ===');
      console.log('data:', JSON.stringify(data, null, 2));
      
      // Vérifier différentes structures de données possibles
      if (data?.messages && Array.isArray(data.messages)) {
        console.log('DEBUG EnhancedChatView - Successfully loaded messages (data.messages):', data.messages.length);
        setMessages(data.messages);
      } else if (data?.data?.messages && Array.isArray(data.data.messages)) {
        console.log('DEBUG EnhancedChatView - Successfully loaded messages (data.data.messages):', data.data.messages.length);
        setMessages(data.data.messages);
      } else {
        console.warn('DEBUG EnhancedChatView - Invalid response format:', data);
        setLoadError('Format de réponse invalide');
      }
    } catch (error) {
      console.error('DEBUG EnhancedChatView - Exception loading messages:', error);
      setLoadError(`Exception: ${(error as Error).message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);
  
  // Fonction pour charger les solutions
  const loadSolutions = async () => {
    try {
      setLoadingSolutions(true);
      setSolutionsError('');
      
      console.log('DEBUG EnhancedChatView - Loading solutions for brief_id:', briefId);
      
      // Obtenir le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Session utilisateur non disponible');
      }
      
      // Appel à l'Edge Function solution-handler
      const response = await fetch('/functions/v1/solution-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get_solutions',
          brief_id: briefId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des solutions');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
      console.log('DEBUG EnhancedChatView - Solutions loaded:', result.data);
      setSolutions(result.data || []);
    } catch (error) {
      console.error('DEBUG EnhancedChatView - Exception loading solutions:', error);
      setSolutionsError(`Une erreur est survenue: ${(error as Error).message}`);
    } finally {
      setLoadingSolutions(false);
    }
  };

  // Fonction pour valider une solution
  const validateSolution = async (solutionId: string) => {
    try {
      console.log('DEBUG EnhancedChatView - Validating solution:', solutionId);
      
      // Mise à jour optimiste
      const solutionToUpdate = solutions.find(s => s.id === solutionId);
      if (!solutionToUpdate) return;
      
      // Créer une copie avec le statut mis à jour
      const updatedSolution = { ...solutionToUpdate, status: 'validated' as const };
      
      // Mettre à jour l'état local immédiatement
      setSolutions(prev => 
        prev.map(solution => solution.id === solutionId ? updatedSolution : solution)
      );
      
      // Obtenir le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Session utilisateur non disponible');
      }
      
      // Appel à l'Edge Function solution-handler
      const response = await fetch('/functions/v1/solution-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'validate_solution',
          solution_id: solutionId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la validation de la solution');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
      console.log('DEBUG EnhancedChatView - Solution validated successfully:', result.data);
      
      // Mettre à jour avec les données réelles retournées par l'API
      setSolutions(prev => 
        prev.map(solution => solution.id === solutionId ? result.data : solution)
      );
      
      // Notifier le parent si nécessaire
      if (onSolutionValidated) {
        onSolutionValidated(solutionId);
      }
      
    } catch (error) {
      console.error('DEBUG EnhancedChatView - Exception validating solution:', error);
      
      // Rollback en cas d'erreur
      const solutionToRestore = solutions.find(s => s.id === solutionId);
      if (solutionToRestore) {
        setSolutions(prev => 
          prev.map(solution => solution.id === solutionId ? { ...solutionToRestore, status: 'proposed' as const } : solution)
        );
      }
      
      alert(`Erreur lors de la validation: ${(error as Error).message}`);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending) return;
    
    setIsSending(true);
    console.log('DEBUG EnhancedChatView - Sending message:', content);
    
    // Message optimiste pour feedback immédiat
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      brief_id: briefId,
      user_id: 'current-user', // Sera remplacé par le vrai ID côté serveur
      content: content,
      is_ai: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setInputValue('');
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
        body: {
          action: 'send_message',
          brief_id: briefId,
          message_content: content
        }
      });
      
      if (error) {
        console.error('DEBUG EnhancedChatView - Error sending message:', error);
        // Retirer le message optimiste en cas d'erreur
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        return;
      }
      
      console.log('DEBUG EnhancedChatView - Message sent successfully:', data);
      onMessageSent?.();
      
      // Remplacer le message optimiste par le vrai message si nécessaire
      // Normalement, le message réel arrivera via la subscription real-time
    } catch (error) {
      console.error('DEBUG EnhancedChatView - Exception sending message:', error);
      // Retirer le message optimiste en cas d'erreur
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [briefId, isSending, onMessageSent]);

  // Charger les messages et les solutions au montage du composant
  useEffect(() => {
    console.log('DEBUG EnhancedChatView - Component mounted, loading initial data');
    loadMessages();
    loadSolutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Scroll automatique vers le bas lorsque les messages changent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // REAL-TIME SUBSCRIPTION pour les messages de chat
  useEffect(() => {
    console.log('DEBUG EnhancedChatView - Setting up chat messages subscription for brief_id:', briefId);
    
    const channel = supabase
      .channel(CHAT_CHANNEL_NAME)
      .on('postgres_changes', {
        event: '*', // Écoute tous les événements (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'chat_messages',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('DEBUG EnhancedChatView - CHAT REALTIME EVENT:', {
          eventType: payload.eventType,
          newRecord: payload.new
        });
        
        // Ne traiter que les nouveaux messages
        if (!payload.new) return;
        
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => {
          // Vérifier si le message existe déjà par ID
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('DEBUG EnhancedChatView - Duplicate chat message detected, ignoring');
            return prev;
          }
          console.log('DEBUG EnhancedChatView - Adding new chat message to state');
          return [...prev, newMessage];
        });
      })
      .subscribe((status) => {
        console.log('DEBUG EnhancedChatView - Chat subscription status:', status);
      });

    return () => {
      console.log('DEBUG EnhancedChatView - Unsubscribing from chat channel');
      supabase.removeChannel(channel);
    };
  }, [briefId]);
  
  // REAL-TIME SUBSCRIPTION pour les solutions
  useEffect(() => {
    console.log('DEBUG EnhancedChatView - Setting up solutions subscription for brief_id:', briefId);
    
    const channel = supabase
      .channel(SOLUTIONS_CHANNEL_NAME)
      .on('postgres_changes', {
        event: '*', // Écoute tous les événements (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'solutions',
        filter: `brief_id=eq.${briefId}`
      }, (payload) => {
        console.log('DEBUG EnhancedChatView - SOLUTION REALTIME EVENT:', {
          eventType: payload.eventType,
          newRecord: payload.new
        });
        
        if (payload.eventType === 'INSERT' && payload.new) {
          // Nouvelle solution ajoutée
          const newSolution = payload.new as Solution;
          setSolutions(prev => {
            if (prev.some(s => s.id === newSolution.id)) return prev;
            return [...prev, newSolution];
          });
        } 
        else if (payload.eventType === 'UPDATE' && payload.new) {
          // Solution mise à jour
          const updatedSolution = payload.new as Solution;
          setSolutions(prev => 
            prev.map(solution => 
              solution.id === updatedSolution.id ? updatedSolution : solution
            )
          );
        }
        else if (payload.eventType === 'DELETE' && payload.old) {
          // Solution supprimée
          const deletedSolutionId = payload.old.id;
          setSolutions(prev => prev.filter(solution => solution.id !== deletedSolutionId));
        }
      })
      .subscribe((status) => {
        console.log('DEBUG EnhancedChatView - Solutions subscription status:', status);
      });

    return () => {
      console.log('DEBUG EnhancedChatView - Unsubscribing from solutions channel');
      supabase.removeChannel(channel);
    };
  }, [briefId]);
  
  // Rendu du composant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Colonne de gauche : Chat */}
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
        <div className="p-4 bg-blue-50 border-b">
          <h2 className="font-semibold text-lg">AI Assistant Chat</h2>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={loadMessages}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : 'Rafraîchir'}
            </button>
          </div>
          {loadError && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
              {loadError}
              <button 
                onClick={loadMessages}
                className="ml-2 underline"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              Aucun message. Commencez la conversation !
            </div>
          )}
          
          {isLoading && messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Chargement des messages...
            </div>
          )}
          
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`p-3 rounded-lg max-w-[85%] ${message.is_ai 
                ? 'bg-blue-100 ml-auto' 
                : 'bg-gray-100 mr-auto'}`}
            >
              <div className="text-sm font-semibold mb-1">
                {message.is_ai ? 'AI Assistant' : 'Vous'}
              </div>
              <div className="text-sm">{message.content}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input pour envoyer un message */}
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isSending ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Colonne de droite : Solutions */}
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
        <div className="p-4 bg-purple-50 border-b">
          <h2 className="font-semibold text-lg">Suggested Solutions</h2>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={loadSolutions}
              disabled={loadingSolutions}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-md hover:bg-purple-200 disabled:opacity-50"
            >
              {loadingSolutions ? 'Chargement...' : 'Rafraîchir'}
            </button>
          </div>
          {solutionsError && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
              {solutionsError}
              <button 
                onClick={loadSolutions}
                className="ml-2 underline"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
        
        {/* Liste des solutions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {solutions.length === 0 && !loadingSolutions && (
            <div className="text-center text-gray-500 py-8">
              Aucune solution proposée pour l'instant.
            </div>
          )}
          
          {loadingSolutions && solutions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
              Chargement des solutions...
            </div>
          )}
          
          {solutions.map(solution => (
            <div 
              key={solution.id} 
              className={`p-4 rounded-lg border ${solution.status === 'validated' 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 hover:border-purple-200'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-md">{solution.title}</h3>
                <div className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {Math.round(solution.ai_confidence * 100)}% Match
                </div>
              </div>
              
              <p className="text-sm mt-2 text-gray-600">{solution.description}</p>
              
              {solution.keywords && solution.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {solution.keywords.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                {solution.status === 'validated' ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Solution Validée
                  </div>
                ) : (
                  <button
                    onClick={() => validateSolution(solution.id)}
                    className="px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600"
                  >
                    Valider Solution
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatView;
