// Types et interfaces partagés pour les composants de chat

// Interface pour les produits
export interface Product {
  id: string;
  name: string;
  product_description: string;
  created_at: string;
  supplier_id: string;
  metadata?: any;
}

// Interface pour les fournisseurs
export interface Supplier {
  id: string;
  name: string;
  description: string;
  website?: string;
  created_at: string;
  brief_id: string;
  products: Product[];
  metadata?: any;
}

// Interface pour les solutions
export interface Solution {
  id: string;
  brief_id: string;
  title: string;
  description: string;
  ai_confidence: number;
  keywords: string[];
  status: 'proposed' | 'validated' | 'rejected' | 'in_progress' | 'finished';
  created_at: string;
  updated_at: string;
  metadata?: any;
  type?: string;
  fast_search_launched_at?: string | null;
  search_progress?: number; // Optionnel: pourcentage de progression (0-100)
  solution_number?: number;
}

// Props pour le composant EnhancedChatView
export interface EnhancedChatViewProps {
  briefId: string;
  onMessageSent?: () => void;
  onSolutionValidated?: (solutionId: string) => void;
}

// Constantes pour les noms des channels real-time
export const CHAT_CHANNEL_NAME = 'chat_messages';
export const SOLUTIONS_CHANNEL_NAME = 'solutions';
export const SUPPLIERS_CHANNEL_NAME = 'suppliers';
export const PRODUCTS_CHANNEL_NAME = 'products';
