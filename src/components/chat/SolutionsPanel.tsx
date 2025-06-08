import React from 'react';
import type { Solution } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface SolutionsPanelProps {
  solutions: Solution[];
  isLoading: boolean;
  error: string | null;
  onValidate: (solutionId: string) => void;
  onRefresh: () => void;
  onStartFastSearch?: (solutionId: string) => void;
  isStartingSearch?: boolean;
  briefHasActiveSearch?: boolean;
  showFastSearchDirectly?: boolean;
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
  onRefresh,
  onStartFastSearch,
  isStartingSearch = false,
  briefHasActiveSearch = false,
  showFastSearchDirectly = false
}) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white w-2/5">
      <div className="p-4 bg-purple-50 border-b">
        <h2 className="font-semibold text-lg">{t('solutions_panel.title', 'Suggested Solutions')}</h2>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            {isLoading ? t('solutions_panel.button.refresh_loading', 'Loading...') : t('solutions_panel.button.refresh', 'Refresh')}
          </button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
            {error}
            <button 
              onClick={onRefresh}
              className="ml-2 underline"
            >
              {t('solutions_panel.button.retry', 'Retry')}
            </button>
          </div>
        )}
      </div>
      
      {/* Liste des solutions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {solutions.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            {t('solutions_panel.no_solutions', 'No solutions proposed yet.')}
          </div>
        )}
        
        {isLoading && solutions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
            {t('solutions_panel.loading_solutions', 'Loading solutions...')}
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
                {Math.round(solution.ai_confidence * 100)}{t('solutions_panel.ai_confidence_match', '% Match')}
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
            
            <div className="mt-4 flex justify-between">
              {(solution.status === 'validated' || showFastSearchDirectly) ? (
                <>
                  {solution.status === 'validated' && !showFastSearchDirectly && (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('solutions_panel.status.validated', 'Solution Validated')}
                    </div>
                  )}
                  {/* Bouton pour lancer Fast Search directement depuis une solution */}
                  {onStartFastSearch && (
                    <button
                      onClick={() => onStartFastSearch(solution.id)}
                      disabled={briefHasActiveSearch || isStartingSearch || solution.fast_search_launched_at !== null}
                      className={`${solution.status === 'validated' ? 'ml-2 ' : ''}px-3 py-1 text-sm rounded-md ${solution.fast_search_launched_at 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : briefHasActiveSearch || isStartingSearch 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      title={solution.fast_search_launched_at 
                        ? t('solutions_panel.fast_search_already_used', 'Fast Search already used for this solution') 
                        : briefHasActiveSearch 
                          ? t('solutions_panel.search_in_progress', 'Search already in progress') 
                          : t('solutions_panel.start_fast_search_tooltip', 'Start a Fast Search with this solution (uses 1 quota token)')}
                    >
                      {isStartingSearch 
                        ? <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('solutions_panel.button.starting_search', 'Starting...')}  
                          </span> 
                        : solution.fast_search_launched_at 
                          ? <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {t('solutions_panel.button.used', 'Used')} 
                            </span>
                          : t('solutions_panel.button.fast_search', 'Fast Search')}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onValidate(solution.id)}
                  className="px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600"
                >
                  {t('solutions_panel.button.validate', 'Validate Solution')}
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
