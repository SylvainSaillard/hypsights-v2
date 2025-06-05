/**
 * Interface pour les messages provenant de la base de données
 * Reflète exactement la structure de la table chat_messages
 */
export interface ChatMessage {
  id: string;
  brief_id: string;
  user_id?: string;
  content: string;      // Le contenu textuel du message
  is_ai: boolean;       // true: message de l'IA, false: message de l'utilisateur
  created_at: string;
}

/**
 * Interface pour l'affichage des messages dans l'UI
 */
export interface UIMessage {
  id: string;
  content: string;      // Le contenu textuel du message à afficher
  isFromAI: boolean;    // true: message de l'IA, false: message de l'utilisateur
  timestamp: string;    // Format ISO string
  isAcknowledgement?: boolean; // Pour afficher des messages de type "message reçu"
  isError?: boolean;    // Pour les messages d'erreur
}

/**
 * Interface pour la compatibilité avec le code existant
 * @deprecated Utiliser UIMessage ou ChatMessage à la place
 */
export interface Message {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: string;
  type: 'user' | 'ai' | 'acknowledgement' | 'error' | 'normal';
}
