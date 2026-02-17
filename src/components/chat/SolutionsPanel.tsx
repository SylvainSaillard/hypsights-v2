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
  onStartTestFastSearch?: (solutionId: string) => void;
  startingSolutionId?: string | null;
  briefHasActiveSearch?: boolean;
  showFastSearchDirectly?: boolean;
  fastSearchQuota?: { used: number; total: number };
  briefTitle?: string;
  isAdmin?: boolean;
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
  onStartTestFastSearch,
  startingSolutionId = null,
  fastSearchQuota,
  briefTitle, // Prop ajoutée mais non utilisée ici, pour la cohérence
  isAdmin = false
}) => {
  const { t } = useI18n();
  
  // Calcul du quota
  const hasQuota = fastSearchQuota ? fastSearchQuota.used < fastSearchQuota.total : true;
  const quotaRemaining = fastSearchQuota ? fastSearchQuota.total - fastSearchQuota.used : 0;
  
  // Tri des solutions par % de confiance (du plus grand au plus petit)
  const sortedSolutions = [...solutions].sort((a, b) => b.ai_confidence - a.ai_confidence);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header avec design moderne */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('solutions_panel.title', 'Suggested Solutions')}
            </h2>
            {fastSearchQuota && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasQuota 
                  ? quotaRemaining <= 1 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {t('solutions_panel.quota.badge', 'Fast Search: {used}/{total}', { 
                  used: fastSearchQuota.used, 
                  total: fastSearchQuota.total 
                })}
              </div>
            )}
          </div>
          <div className="ml-6">
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
        {sortedSolutions.length === 0 && !isLoading && (
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
        
        {isLoading && sortedSolutions.length === 0 && (
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
        
        {sortedSolutions.map(solution => (
          <div 
            key={solution.id} 
            className={`bg-white rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              solution.status === 'validated' && !solution.fast_search_status
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                : ['pending', 'in_progress'].includes(solution.fast_search_status || '')
                ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50'
                : solution.fast_search_status === 'success'
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50'
                : solution.status === 'validated'
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="p-6">
              {/* Header de la solution */}
              <div className="flex items-start justify-between mb-3">
                <div className="pr-4">
                  {solution.solution_number ? (
                    <>
                      <h3 className="font-bold text-xl text-purple-600">
                        {t('solution.title', 'Solution')} #{solution.solution_number}
                      </h3>
                      <h4 className="font-semibold text-gray-800 leading-tight text-md mt-1">
                        {solution.title}
                      </h4>
                    </>
                  ) : (
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                      {solution.title}
                    </h3>
                  )}
                </div>
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
                {/* Priorité 1: Fast Search en cours (pending ou in_progress) */}
                {['pending', 'in_progress'].includes(solution.fast_search_status || '') ? (
                  <div className="flex items-center justify-center text-blue-600 text-sm font-medium py-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('solutions_panel.status.in_progress', 'Search in progress...')}
                    {solution.search_progress && (
                      <span className="ml-2 bg-blue-100 px-2 py-1 rounded-full text-xs">
                        {solution.search_progress}%
                      </span>
                    )}
                  </div>
                ) : solution.fast_search_status === 'success' ? (
                  /* Priorité 2: Fast Search terminée avec succès */
                  <div className="flex items-center justify-center text-indigo-600 text-sm font-medium py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('solutions_panel.status.finished', 'Search completed')}
                  </div>
                ) : solution.status === 'validated' ? (
                  /* Priorité 3: Solution validée, prête pour Fast Search */
                  <>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {t('solutions_panel.status.validated', 'Solution validated')}
                    </div>
                    
                    {/* Reminder pour la consommation de token */}
                    {onStartFastSearch && (
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-amber-700 leading-relaxed">
                              {t('solutions_panel.solution_reminder.message', 'Fast Search will consume 1 token. {remaining} searches remaining.', {
                                remaining: quotaRemaining
                              })}
                            </p>
                          </div>
                          {hasQuota && (
                            <div className="flex-shrink-0">
                              <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-300">
                                {quotaRemaining}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {onStartFastSearch && (
                      <div className="relative group">
                        <button
                          onClick={() => onStartFastSearch(solution.id)}
                          disabled={startingSolutionId === solution.id || !hasQuota}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            startingSolutionId === solution.id || !hasQuota
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
                            {t('solutions_panel.button.fast_search', 'Ok to launch fast search')}
                          </span>
                        )}
                      </button>
                      {/* Tooltip pour quota épuisé */}
                      {!hasQuota && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {t('solutions_panel.quota.exhausted', 'Fast search quota exhausted')}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                    )}
                    
                    {/* Bouton Test Fast Search - Admin only */}
                    {isAdmin && onStartTestFastSearch && (
                      <button
                        onClick={() => onStartTestFastSearch(solution.id)}
                        disabled={startingSolutionId === solution.id}
                        className="w-full py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-orange-400 to-amber-500 text-white hover:from-orange-500 hover:to-amber-600 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {t('solutions_panel.button.test_fast_search', 'Test Fast Search')}
                      </button>
                    )}
                  </>
                ) : (
                  /* Priorité 4: Solution non validée */
                  <button
                    onClick={() => onValidate(solution.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('solutions_panel.button.validate', 'Interested by this solution?')}
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
