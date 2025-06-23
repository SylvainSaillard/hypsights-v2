import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';

import { useI18n } from '../../contexts/I18nContext';

type Brief = {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'deep_waiting';
  created_at: string;
  updated_at: string;
  solutions_count: number;
  products_count: number;
  suppliers_count: number;
};

type StatusFilter = 'all' | 'draft' | 'active' | 'deep_waiting';

/**
 * Brief Management Grid component
 * Displays briefs with status badges and actions
 * Follows Hypsights design system for consistent UI
 */
const BriefManagementGrid: React.FC = () => {
    const { t, locale } = useI18n();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Fetch briefs with stats from edge function
    const { data, loading, error } = useEdgeFunction('dashboard-data', { 
    action: 'get_briefs_with_stats' 
  }, 'POST');

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
  
  // Enhanced status badge component with design tokens
  const StatusBadge: React.FC<{ status: Brief['status'] }> = ({ status }) => {
    const badgeClasses = {
      draft: 'bg-badge-draft-bg text-badge-draft-text border border-gray-300',
      active: 'bg-badge-active-bg text-badge-active-text border border-green-400 shadow-sm',
      deep_waiting: 'bg-badge-deep-waiting-bg text-badge-deep-waiting-text border border-purple-400 shadow-sm'
    };
    
    const statusLabels = {
      draft: t('brief.status.draft', 'Draft'),
      active: t('brief.status.active', 'Active'),
      deep_waiting: t('brief.status.deep_waiting', 'Deep Search')
    };
    
    const statusIcons = {
      draft: (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4z" clipRule="evenodd" />
        </svg>
      ),
      active: (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      deep_waiting: (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 11-.992 1.736L3 15.277V16a1 1 0 11-2 0v-2a.996.996 0 01.52-.878L3 11zm14 0a1 1 0 01.48.124l1.734.99A.996.996 0 0120 13v2a1 1 0 11-2 0v-.723l-1.254-.145a1 1 0 11-.992-1.736L16.984 13l-.23-.132A1 1 0 0117 11z" clipRule="evenodd" />
        </svg>
      )
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${badgeClasses[status]} transition-all duration-200`}>
        {statusIcons[status]}
        {statusLabels[status]}
      </span>
    );
  };
  
  // Filter briefs based on selected status
      const filteredBriefs = data?.data?.filter((brief: Brief) => 
    statusFilter === 'all' || brief.status === statusFilter
  ) || [];

  type StatBoxProps = {
    icon: React.ReactNode;
    label: string;
    value: number;
    colorClass: string;
    hasResults: boolean;
  };

  const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, colorClass, hasResults }) => (
    <div className={`flex-1 p-3 rounded-lg text-center transition-all duration-200 ${hasResults ? colorClass : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex justify-center items-center mb-1">
        {icon}
      </div>
      <p className={`text-lg font-bold ${hasResults ? 'text-current' : 'text-gray-400'}`}>
        {hasResults ? value : '—'}
      </p>
      <p className={`text-xs ${hasResults ? 'text-current opacity-80' : 'text-gray-500'}`}>
        {label}
      </p>
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
  
  const statusOptions = [
    { value: 'all' as StatusFilter, label: t('brief.filter.all', 'All Briefs') },
    { value: 'draft' as StatusFilter, label: t('brief.filter.draft', 'Draft') },
    { value: 'active' as StatusFilter, label: t('brief.filter.active', 'Active') },
    { value: 'deep_waiting' as StatusFilter, label: t('brief.filter.deep_waiting', 'Deep Search') }
  ];

  return (
    <div className="bg-card rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('brief.grid.title.main', 'Your Briefs')}</h2>
        
        {/* Enhanced Status Filter */}
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
          {statusOptions.map(({ value: statusValue, label: statusLabel }) => (
            <button
              key={statusValue}
              onClick={() => setStatusFilter(statusValue)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                statusFilter === statusValue
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {statusLabel}
            </button>
          ))}
        </div>
      </div>
      
      {filteredBriefs.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {statusFilter === 'all' 
              ? t('brief.empty.no_briefs', 'No briefs yet') 
              : t('brief.empty.no_briefs_filtered', 'No briefs with this status')
            }
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {statusFilter === 'all' 
              ? t('brief.empty.description', 'Create your first brief to start finding suppliers and products for your business needs.')
              : t('brief.empty.description_filtered', 'Try changing the filter or create a new brief.')
            }
          </p>
          {statusFilter === 'all' && (
            <Link
              to="/dashboard/briefs/new"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('brief.empty.create_button', 'Create Brief')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBriefs.map((brief: Brief) => {
              const hasResults = brief.solutions_count > 0 || brief.products_count > 0 || brief.suppliers_count > 0;
              const cardClasses = hasResults 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl'
                : 'bg-white border-gray-200 shadow-md hover:shadow-lg';

              return (
                <div 
                  key={brief.id}
                  className={`group p-6 rounded-xl border transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${cardClasses}`}
                  onClick={() => window.location.href = `/dashboard/briefs/${brief.id}/chat`}
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <StatusBadge status={brief.status} />
                      <div className="text-right">
                        <span className="text-sm text-gray-500 block">{formatDate(brief.created_at)}</span>
                        {hasResults && (
                          <span className="inline-flex items-center text-xs text-green-600 font-medium mt-1">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('brief.card.has_results', 'Has Results')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {brief.title || t('brief.card.untitled', 'Untitled Brief')}
                    </h3>

                    {/* Stats */}
                    <div className="flex gap-2 mb-6 flex-1">
                      <StatBox 
                        label={t('kpi.card.suppliers_found.title', 'Suppliers')} 
                        value={brief.suppliers_count} 
                        hasResults={brief.suppliers_count > 0}
                        colorClass="bg-blue-100 text-blue-700 border border-blue-200"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                      />
                      <StatBox 
                        label={t('brief.card.products_count', 'Products')} 
                        value={brief.products_count} 
                        hasResults={brief.products_count > 0}
                        colorClass="bg-purple-100 text-purple-700 border border-purple-200"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                      />
                      <StatBox 
                        label={t('brief.card.solutions_count', 'Solutions')} 
                        value={brief.solutions_count} 
                        hasResults={brief.solutions_count > 0}
                        colorClass="bg-indigo-100 text-indigo-700 border border-indigo-200"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l.707.707m12.728 0l-.707.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z" /></svg>}
                      />
                    </div>

                    {/* Action Button */}
                    <button className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-200 ${
                      hasResults 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}>
                      {hasResults ? (
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {t('brief.action.view_results', 'View Results')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t('brief.action.complete_submit', 'Complete & Submit Brief')}
                        </span>
                      )}
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
