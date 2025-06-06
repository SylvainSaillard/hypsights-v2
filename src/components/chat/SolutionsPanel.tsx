import React from 'react';
import type { Solution } from './types';

interface SolutionsPanelProps {
  solutions: Solution[];
  isLoading: boolean;
  error: string | null;
  onValidate: (solutionId: string) => void;
  onRefresh: () => void;
}

/**
 * Composant d'affichage du panneau de solutions
 * Conforme au principe KISS - UI pure sans logique métier
 */
const SolutionsPanel: React.FC<SolutionsPanelProps> = ({
  solutions,
  isLoading,
  error,
  onValidate,
  onRefresh
}) => {
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white w-2/5">
      <div className="p-4 bg-purple-50 border-b">
        <h2 className="font-semibold text-lg">Suggested Solutions</h2>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Rafraîchir'}
          </button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
            {error}
            <button 
              onClick={onRefresh}
              className="ml-2 underline"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
      
      {/* Liste des solutions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {solutions.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            Aucune solution proposée pour l'instant.
          </div>
        )}
        
        {isLoading && solutions.length === 0 && (
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
                  onClick={() => onValidate(solution.id)}
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
  );
};

export default SolutionsPanel;
