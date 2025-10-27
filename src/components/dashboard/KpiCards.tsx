import React, { useState, useEffect } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import FastSearchQuotaModal from '../modals/FastSearchQuotaModal';

/**
 * KPI Cards component for the dashboard
 * Shows key metrics from the server including:
 * - Active briefs count
 * - Completed searches count
 * - Suppliers found count
 * - Quota usage with visual indicator
 * - Auto-popup when quota is reached
 */
const KpiCards: React.FC = () => {
  // Fetch dashboard data from edge function explicitly using POST method
  // This helps avoid CORS issues since our Edge Functions better support POST
  const { t } = useI18n();
  const { user } = useAuth();
  const { data, loading, error, refresh: _refresh } = useEdgeFunction('dashboard-data', { action: 'get_user_metrics' }, { method: 'POST' });
  
  // State for quota modal
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [hasShownQuotaModal, setHasShownQuotaModal] = useState(false);
  
  // Log debugging information for CORS issues
  useEffect(() => {
    if (error) {
      console.error('KpiCards data fetch error:', error);
    }
    if (data) {
      console.log('KpiCards data received:', data);
    }
  }, [data, error]);
  
  // Auto-show quota modal when quota is reached (100%)
  useEffect(() => {
    if (data?.data && !hasShownQuotaModal) {
      const metrics = data.data;
      const quotaPercentage = Math.min(100, Math.round((metrics.fast_searches_used / metrics.fast_searches_quota) * 100));
      
      // Show modal when quota is at 100%
      if (quotaPercentage >= 100) {
        console.log('Fast Search quota reached - showing modal');
        setIsQuotaModalOpen(true);
        setHasShownQuotaModal(true);
      }
    }
  }, [data, hasShownQuotaModal]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card animate-pulse rounded-xl shadow-lg p-6 h-36 border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl mb-8">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">{t('kpi.error.load_failed', 'Failed to load dashboard data')}</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // L'Edge Function renvoie les données dans data.dashboard.metrics
  const metrics = data?.data || {
    activeBriefs: 0,
    completedSearches: 0,
    suppliersFound: 0,
    fast_searches_used: 0,
    fast_searches_quota: 3,
    briefsCreatedThisWeek: 0,
    lastSearchDate: null
  };
  
  // Helper function to format relative time
  const getRelativeTime = (dateString: string | null): string => {
    if (!dateString) return t('kpi.card.change_none', 'None yet');
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('kpi.card.time.today', 'Today');
    if (diffDays === 1) return t('kpi.card.time.yesterday', 'Yesterday');
    if (diffDays < 7) return t('kpi.card.time.days_ago', '{days} days ago', { days: diffDays });
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('kpi.card.time.weeks_ago', '{weeks} week(s) ago', { weeks });
    }
    const months = Math.floor(diffDays / 30);
    return t('kpi.card.time.months_ago', '{months} month(s) ago', { months });
  };
  
  // Calculate quota percentage
  const quotaPercentage = Math.min(100, Math.round((metrics.fast_searches_used / metrics.fast_searches_quota) * 100));
  
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      change: metrics.briefsCreatedThisWeek > 0 
        ? t('kpi.card.active_briefs.change_dynamic', '+{count} this week', { count: metrics.briefsCreatedThisWeek })
        : t('kpi.card.change_none', 'None this week'),
      changeType: metrics.briefsCreatedThisWeek > 0 ? 'positive' : 'neutral',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: t('kpi.card.completed_searches.title', 'Completed Searches'),
      value: metrics.completedSearches,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      change: metrics.lastSearchDate 
        ? t('kpi.card.completed_searches.change_dynamic', 'Last: {time}', { time: getRelativeTime(metrics.lastSearchDate) })
        : t('kpi.card.change_none', 'None yet'),
      changeType: metrics.lastSearchDate ? 'neutral' : 'negative',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      title: t('kpi.card.suppliers_found.title', 'Suppliers Found'),
      value: metrics.suppliersFound,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      change: metrics.suppliersFound > 0 && metrics.completedSearches > 0
        ? t('kpi.card.suppliers_found.change_per_search', '~{count} per search', { count: Math.round(metrics.suppliersFound / metrics.completedSearches) })
        : t('kpi.card.change_none', 'None yet'),
      changeType: metrics.suppliersFound > 0 ? 'positive' : 'neutral',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: t('kpi.card.fast_search_quota.title', 'Fast Search Quota'),
      value: `${metrics.fast_searches_used}/${metrics.fast_searches_quota}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${getQuotaStatusColor()} drop-shadow-sm`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgGradient: quotaPercentage >= 90 ? 'from-red-50 to-red-100' : quotaPercentage >= 75 ? 'from-yellow-50 to-yellow-100' : 'from-emerald-50 to-emerald-100',
      borderColor: quotaPercentage >= 90 ? 'border-red-200' : quotaPercentage >= 75 ? 'border-yellow-200' : 'border-emerald-200',
      customContent: (
        <div className="mt-3">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  quotaPercentage >= 90 ? 'bg-red-500' : 
                  quotaPercentage >= 75 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`} 
                style={{ width: `${quotaPercentage}%` }}
              ></div>
            </div>
            <span className={`ml-3 text-sm font-semibold ${getQuotaStatusColor()}`}>
              {quotaPercentage}%
            </span>
          </div>
          {quotaPercentage >= 100 ? (
            <button
              onClick={() => setIsQuotaModalOpen(true)}
              className="mt-2 w-full text-xs text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              {t('kpi.card.fast_search_quota.get_more', '🎁 Obtenir +3 Fast Search')}
            </button>
          ) : quotaPercentage >= 90 && (
            <p className="text-xs text-red-600 mt-2 font-medium">{t('kpi.card.fast_search_quota.upgrade', 'Consider upgrading your plan')}</p>
          )}
        </div>
      )
    }
  ];

  const handleQuotaModalClose = () => {
    setIsQuotaModalOpen(false);
  };

  const handleQuotaModalSuccess = () => {
    // Optionally refresh the data after successful submission
    console.log('Quota request submitted successfully');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 perspective-1000">
        {kpiCards.map((card, index) => (
          <div 
            key={index} 
            className={`group bg-gradient-to-br ${card.bgGradient || 'from-white to-gray-50'} rounded-xl shadow-lg border ${card.borderColor || 'border-gray-200'} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start relative">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide group-hover:text-gray-800 transition-colors duration-300">{card.title}</h3>
                <p className="text-3xl font-bold mt-2 text-gray-900 group-hover:scale-105 transform transition-transform duration-300">{card.value}</p>
                {/* Change info hidden as per user request - not important */}
              </div>
              <div className={`ml-4 p-3 rounded-xl shadow-md bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border ${card.borderColor} transform transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-lg`}>
                {card.icon}
              </div>
            </div>
            {card.customContent}
          </div>
        ))}
      </div>

      {/* Fast Search Quota Modal */}
      <FastSearchQuotaModal
        isOpen={isQuotaModalOpen}
        onClose={handleQuotaModalClose}
        onSuccess={handleQuotaModalSuccess}
        userEmail={user?.email || ''}
        userName={user?.user_metadata?.full_name || user?.email || ''}
      />
    </>
  );
};

export default KpiCards;
