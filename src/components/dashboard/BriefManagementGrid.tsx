import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import useEdgeFunction from '../../hooks/useEdgeFunction';

type Brief = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  solutions_count: number;
  products_count: number;
  suppliers_count: number;
};

/**
 * Brief Management Grid component
 * Displays briefs with actions
 * Follows Hypsights design system for consistent UI
 */
const BriefManagementGrid: React.FC = () => {
  const { t, locale } = useI18n();

  // Fetch briefs with stats from edge function
  const { data, loading, error } = useEdgeFunction('dashboard-data', { 
    action: 'get_briefs_with_stats' 
  }, { method: 'POST' });

  // Log data for debugging
  useEffect(() => {
    if (data) {
      console.log('Briefs with stats received:', data);
    }
    if (error) {
      console.error('Error fetching briefs with stats:', error);
    }
  }, [data, error]);
  
  // Function to format date as "DD MMM YYYY"
  const formatDate = (dateString: string) => {
    // Use the locale from i18n context for date formatting
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  type StatBoxProps = {
    icon: React.ReactNode;
    label: string;
    value: number;
    colorClass: string;
    hasResults: boolean;
  };

  const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, colorClass, hasResults }) => (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasResults ? colorClass : 'bg-gray-100'} mb-2 transition-all duration-300 transform hover:scale-110`}>
        {icon}
      </div>
      <div className="text-center">
        <p className={`text-lg font-bold ${hasResults ? 'text-gray-900' : 'text-gray-400'}`}>
          {hasResults ? value : '—'}
        </p>
        <p className="text-xs text-gray-500 leading-tight">
          {label}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('brief.grid.title.main', 'Your Briefs')}</h2>
          <div className="animate-pulse w-40 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">{t('brief.grid.error.load_failed', 'Failed to load briefs')}</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredBriefs = data?.data || [];

  return (
    <div className="bg-card rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('brief.grid.title.main', 'Your Briefs')}</h2>
      </div>
      
      {filteredBriefs.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('brief.empty.no_briefs', 'No briefs yet')}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('brief.empty.description', 'Create your first brief to start finding suppliers and products for your business needs.')}
          </p>
          <Link
            to="/dashboard/briefs/new"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('brief.empty.create_button', 'Create Brief')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBriefs.map((brief: Brief) => {
              const totalResults = (brief.products_count || 0) + (brief.suppliers_count || 0) + (brief.solutions_count || 0);
              const hasResults = totalResults > 0;
              
              const cardClasses = hasResults 
                ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-green-300 shadow-xl hover:shadow-2xl'
                : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl';

              return (
                <div 
                  key={brief.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:rotate-1 ${cardClasses}`}
                  onClick={() => window.location.href = `/dashboard/briefs/${brief.id}/chat`}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6 flex flex-col h-full">
                    {/* Title and Description */}
                    <div className="mb-6 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {brief.title || t('brief.card.untitled', 'Untitled Brief')}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(brief.created_at)}</span>
                      </div>
                      
                      {/* Results summary */}
                      <div className="flex items-center text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold text-green-600">{totalResults}</span>
                          <span className="text-gray-600">total results found</span>
                        </div>
                      </div>
                    </div>

                    {/* Gamified Stats */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                      <div className="flex justify-around items-center">
                        <div className="grid grid-cols-3 gap-4">
                          <StatBox 
                            label={t('brief.card.suppliers_count', 'Suppliers')} 
                            value={brief.suppliers_count} 
                            hasResults={brief.suppliers_count > 0}
                            colorClass="bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                          />
                          <StatBox 
                            label={t('brief.card.products_count', 'Products')} 
                            value={brief.products_count} 
                            hasResults={brief.products_count > 0}
                            colorClass="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                          />
                          <StatBox 
                            label={t('brief.card.solutions_count', 'Solutions')} 
                            value={brief.solutions_count} 
                            hasResults={brief.solutions_count > 0}
                            colorClass="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l.707.707m12.728 0l-.707.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z" /></svg>}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gamified Action Button */}
                    <button className={`relative w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                      hasResults 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg hover:shadow-xl'
                    }`}>
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative flex items-center justify-center">
                        {hasResults ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>
                              {totalResults > 0 ? 
                                t('brief.action.view_results_count', `⚡ Explore ${totalResults} Results`) :
                                t('brief.action.view_results', '⚡ View Results')
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>{t('brief.action.complete_submit', '🚀 Start Your Quest')}</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      )}
    </div>
  );
};

export default BriefManagementGrid;
