import React from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';

/**
 * KPI Cards component for the dashboard
 * Shows key metrics from the server including:
 * - Active briefs count
 * - Completed searches count
 * - Suppliers found count
 * - Quota usage with visual indicator
 */
const KpiCards: React.FC = () => {
  // Fetch dashboard data from edge function explicitly using POST method
  // This helps avoid CORS issues since our Edge Functions better support POST
  const { t } = useI18n();
  const { data, loading, error, refresh: _refresh } = useEdgeFunction('dashboard-data', { action: 'get_user_metrics' }, 'POST');
  
  // Log debugging information for CORS issues
  React.useEffect(() => {
    if (error) {
      console.error('KpiCards data fetch error:', error);
    }
    if (data) {
      console.log('KpiCards data received:', data);
    }
  }, [data, error]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card animate-pulse rounded-lg shadow-md p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8">
        <p className="font-medium">{t('kpi.error.load_failed', 'Failed to load dashboard data')}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // L'Edge Function renvoie les données dans data.dashboard.metrics
  const metrics = data || {
    activeBriefs: 0,
    completedSearches: 0,
    suppliersFound: 0,
    quotaUsed: 0,
    quotaLimit: 3
  };
  
  // Calculate quota percentage
  const quotaPercentage = Math.min(100, Math.round((metrics.quotaUsed / metrics.quotaLimit) * 100));
  
  // Determine quota status color
  const getQuotaStatusColor = () => {
    if (quotaPercentage >= 90) return 'text-red-600';
    if (quotaPercentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const kpiCards = [
    {
      title: t('kpi.card.active_briefs.title', 'Active Briefs'),
      value: metrics.activeBriefs,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      change: t('kpi.card.active_briefs.change_static_example', '+2 this week'),
      changeType: 'positive'
    },
    {
      title: t('kpi.card.completed_searches.title', 'Completed Searches'),
      value: metrics.completedSearches,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      change: metrics.completedSearches > 0 ? t('kpi.card.completed_searches.change_recent', 'Last: Yesterday') : t('kpi.card.change_none', 'None yet'),
      changeType: metrics.completedSearches > 0 ? 'neutral' : 'negative'
    },
    {
      title: t('kpi.card.suppliers_found.title', 'Suppliers Found'),
      value: metrics.suppliersFound,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-supplier-badge" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      change: metrics.suppliersFound > 0 ? t('kpi.card.suppliers_found.change_per_search', '{count} per search', { count: Math.round(metrics.suppliersFound / Math.max(1, metrics.completedSearches)) }) : t('kpi.card.change_none', 'None yet'),
      changeType: metrics.suppliersFound > 0 ? 'positive' : 'neutral'
    },
    {
      title: t('kpi.card.fast_search_quota.title', 'Fast Search Quota'),
      value: `${metrics.quotaUsed}/${metrics.quotaLimit}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${getQuotaStatusColor()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      customContent: (
        <div className="mt-2">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  quotaPercentage >= 90 ? 'bg-red-600' : 
                  quotaPercentage >= 75 ? 'bg-yellow-500' : 
                  'bg-green-600'
                }`} 
                style={{ width: `${quotaPercentage}%` }}
              ></div>
            </div>
            <span className={`ml-2 text-sm font-medium ${getQuotaStatusColor()}`}>
              {quotaPercentage}%
            </span>
          </div>
          {quotaPercentage >= 90 && (
            <p className="text-xs text-red-600 mt-1">{t('kpi.card.fast_search_quota.upgrade', 'Consider upgrading your plan')}</p>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpiCards.map((card, index) => (
        <div key={index} className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
              {!card.customContent && (
                <p className={`text-xs mt-1 ${
                  card.changeType === 'positive' ? 'text-green-600' : 
                  card.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {card.change}
                </p>
              )}
            </div>
            {card.icon}
          </div>
          {card.customContent}
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
