import React from 'react';
import { Message } from './ChatInterface';

interface SimplifiedChatViewProps {
  briefTitle?: string;
  briefDescription?: string;
  briefId?: string;
}

/**
 * Version simplifiée du chat qui affiche uniquement l'en-tête du brief
 * et un message de statut sans fonctionnalité de chat active
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
const SimplifiedChatView: React.FC<SimplifiedChatViewProps> = ({
  briefTitle = "Titre du brief",
  briefDescription = "Description du brief en cours d'exploration",
  briefId = "ID-placeholder"
}) => {
  
  return (
    <div className="flex flex-col h-full">
      {/* En-tête du brief */}
      <div className="bg-primary bg-opacity-5 p-6 border-b">
        <h2 className="text-xl font-semibold text-primary">{briefTitle}</h2>
        <p className="text-sm text-gray-600 mt-2">{briefDescription}</p>
        <div className="mt-3 flex items-center text-xs text-gray-500">
          <span className="mr-3">Brief #{briefId.slice(0, 8)}</span>
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
            En développement
          </span>
        </div>
      </div>
      
      {/* Zone de chat désactivée */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">Interface de dialogue</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            La fonctionnalité de chat est actuellement désactivée pour visualiser l'interface. 
            Le backend n8n n'est pas appelé dans cette version.
          </p>
        </div>
      </div>
      
      {/* Zone de saisie désactivée */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Fonctionnalité temporairement désactivée..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400"
            disabled
          />
          <button
            disabled
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedChatView;
