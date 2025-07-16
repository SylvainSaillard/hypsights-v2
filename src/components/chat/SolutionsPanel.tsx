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
  startingSolutionId?: string | null;
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
  startingSolutionId = null
}) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col h-full">
      {/* Header avec design moderne */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t('solutions_panel.title', 'Suggested Solutions')}
          </h2>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-white shadow-md border border-purple-200 text-purple-700 text-sm rounded-lg hover:bg-purple-50 hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? t('solutions_panel.button.refresh_loading', 'Loading...') : t('solutions_panel.button.refresh', 'Refresh')}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
              <button 
                onClick={onRefresh}
                className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                {t('solutions_panel.button.retry', 'Retry')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Liste des solutions avec scroll amélioré */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {solutions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {t('solutions_panel.no_solutions', 'No solutions proposed yet.')}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Start chatting with the AI to get personalized solutions
            </p>
          </div>
        )}
        
        {isLoading && solutions.length === 0 && (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              {t('solutions_panel.loading_solutions', 'Loading solutions...')}
            </p>
          </div>
        )}
        
        {solutions.map(solution => (
          <div 
            key={solution.id} 
            className={`bg-white rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              solution.status === 'validated' 
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                : solution.status === 'in_progress'
                ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50'
                : solution.status === 'finished'
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="p-6">
              {/* Header de la solution */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 leading-tight pr-4">{solution.title}</h3>
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-md">
                    {Math.round(solution.ai_confidence * 100)}{t('solutions_panel.ai_confidence_match', '% Match')}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{solution.description}</p>
              
              {/* Keywords avec design amélioré */}
              {solution.keywords && solution.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {solution.keywords.map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full border border-gray-300 font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions et statuts */}
              <div className="flex flex-col gap-3">
                {solution.status === 'validated' ? (
                  <>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {t('solutions_panel.status.validated', 'Solution validated')}
                    </div>
                    
                    {onStartFastSearch && !['in_progress', 'finished'].includes(solution.status) && (
                      <button
                        onClick={() => onStartFastSearch(solution.id)}
                        disabled={startingSolutionId === solution.id}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                          startingSolutionId === solution.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {startingSolutionId === solution.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            {t('solutions_panel.button.starting_search', 'Starting...')}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {t('solutions_panel.button.fast_search', 'Fast Search')}
                          </span>
                        )}
                      </button>
                    )}
                  </>
                ) : solution.status === 'in_progress' ? (
                  <div className="flex items-center justify-center text-blue-600 text-sm font-medium py-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('solutions_panel.status.in_progress', 'Search in progress...')}
                    {solution.search_progress && (
                      <span className="ml-2 bg-blue-100 px-2 py-1 rounded-full text-xs">
                        {solution.search_progress}%
                      </span>
                    )}
                  </div>
                ) : solution.status === 'finished' ? (
                  <div className="flex items-center justify-center text-indigo-600 text-sm font-medium py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('solutions_panel.status.finished', 'Search completed')}
                  </div>
                ) : (
                  <button
                    onClick={() => onValidate(solution.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('solutions_panel.button.validate', 'Validate Solution')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolutionsPanel;
