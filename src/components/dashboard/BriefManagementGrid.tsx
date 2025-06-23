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
  
  // Status badge component with color coding
  const StatusBadge: React.FC<{ status: Brief['status'] }> = ({ status }) => {
    const badgeClasses = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      deep_waiting: 'bg-purple-100 text-purple-800'
    };
    
    const statusLabels = {
      draft: t('brief.status.draft', 'Draft'),
      active: t('brief.status.active', 'Active'),
      deep_waiting: t('brief.status.deep_waiting', 'Deep Search')
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[status]}`}>
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
    <div className={`flex-1 p-4 rounded-lg text-center ${hasResults ? colorClass : 'bg-gray-100'}`}>
      <div className="flex justify-center items-center mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold">{hasResults ? value : '-'}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('brief.grid.title.main', 'Your Briefs')}</h2>
          <div className="animate-pulse w-40 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
      <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8">
        <p className="font-medium">{t('brief.grid.error.load_failed', 'Failed to load briefs')}</p>
        <p className="text-sm">{error.toString()}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">{t('brief.grid.title.main', 'Your Briefs')}</h2>
        
        {/* Status filter buttons */}
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('brief.filter.label_prefix', 'Filter:')}</span>
          {([['all', t('brief.filter.all', 'All')], ['draft', t('brief.status.draft', 'Draft')], ['active', t('brief.status.active', 'Active')], ['deep_waiting', t('brief.status.deep_waiting', 'Deep Search')]] as [StatusFilter, string][]).map(([statusValue, statusLabel]) => (
            <button
              key={statusValue}
              onClick={() => setStatusFilter(statusValue)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition whitespace-nowrap ${
                statusFilter === statusValue
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusLabel}
            </button>
          ))}
        </div>
      </div>
      
      {filteredBriefs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700">{t('brief.empty.title', 'No Briefs Yet')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all'
              ? t('brief.empty.message', "Get started by creating your first brief. It's quick and easy!")
              : `No briefs with ${statusFilter} status`}
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/briefs/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:scale-105 transition duration-200"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t('brief.empty.create_button', 'Create Brief')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBriefs.map((brief: Brief) => {
              const hasResults = brief.solutions_count > 0 || brief.products_count > 0 || brief.suppliers_count > 0;
              const cardClasses = hasResults 
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-200';

              return (
                <div 
                  key={brief.id}
                  className={`p-6 rounded-lg border hover:shadow-xl transition-shadow cursor-pointer flex flex-col justify-between ${cardClasses}`}
                  onClick={() => window.location.href = `/dashboard/briefs/${brief.id}/chat`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <StatusBadge status={brief.status} />
                      <span className="text-sm text-gray-500">{formatDate(brief.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {brief.title || t('brief.card.untitled', 'Untitled Brief')}
                    </h3>

                    <div className="flex gap-4 my-6">
                      <StatBox 
                        label={t('kpi.card.suppliers_found.title', 'Suppliers')} 
                        value={brief.suppliers_count} 
                        hasResults={hasResults}
                        colorClass="bg-blue-100 text-blue-800"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                      />
                      <StatBox 
                        label={t('brief.card.products_count', 'Products')} 
                        value={brief.products_count} 
                        hasResults={hasResults}
                        colorClass="bg-purple-100 text-purple-800"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                      />
                      <StatBox 
                        label={t('brief.card.solutions_count', 'Solutions')} 
                        value={brief.solutions_count} 
                        hasResults={hasResults}
                        colorClass="bg-indigo-100 text-indigo-800"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l.707.707m12.728 0l-.707.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z" /></svg>}
                      />
                    </div>
                  </div>

                  <button className={`w-full py-2 px-4 rounded-lg font-semibold text-center transition-colors ${hasResults ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {hasResults ? t('brief.action.view_results', 'View Results') : t('brief.action.complete_submit', 'Complete & Submit Brief')}
                  </button>
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
