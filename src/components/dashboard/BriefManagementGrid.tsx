import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { executeEdgeAction } from '../../lib/edgeActionHelper';
import { useI18n } from '../../contexts/I18nContext';

type Brief = {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'deep_waiting';
  created_at: string;
  updated_at: string;
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
  
  // Fetch briefs from edge function
  const { data, loading, error, refresh } = useEdgeFunction('brief-operations', { 
    action: 'list_briefs' 
  }, 'POST');
  
  const handleDelete = async (briefId: string) => {
    if (!window.confirm(t('brief.delete.confirm', 'Are you sure you want to delete this brief?'))) {
      return;
    }
    
    try {
      // Utiliser l'helper executeEdgeAction qui gère correctement l'authentification
      await executeEdgeAction('brief-operations', 'delete_brief', {
        brief_id: briefId
      });
      
      // Refresh the briefs list
      refresh();
      
    } catch (error: any) {
      console.error('Failed to delete brief:', error.message || error);
    }
  };
  
  const handleDuplicate = async (briefId: string) => {
    try {
      // Utiliser l'helper executeEdgeAction qui gère correctement l'authentification
      await executeEdgeAction('brief-operations', 'duplicate_brief', {
        brief_id: briefId
      });
      
      // Refresh the briefs list
      refresh();
      
    } catch (error: any) {
      console.error('Failed to duplicate brief:', error.message || error);
    }
  };
  
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
  const filteredBriefs = data?.briefs?.filter((brief: Brief) => 
    statusFilter === 'all' || brief.status === statusFilter
  ) || [];
  
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
        <p className="text-sm">{error}</p>
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
          {filteredBriefs.map((brief: Brief) => (
            <div 
              key={brief.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer relative"
              onClick={(e) => {
                // Prevent navigation if clicking on action buttons
                if ((e.target as Element).closest('button') || (e.target as Element).closest('a')) {
                  return;
                }
                window.location.href = `/dashboard/briefs/${brief.id}/chat`;
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {brief.title || t('brief.card.untitled', 'Untitled Brief')}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <StatusBadge status={brief.status} />
                    <span>{t('brief.card.created_label', 'Created:')} {formatDate(brief.created_at)}</span>
                    {brief.updated_at !== brief.created_at && (
                      <span>{t('brief.card.updated_label', 'Updated:')} {formatDate(brief.updated_at)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 z-10">
                  <Link
                    to={`/dashboard/briefs/${brief.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                    title={t('brief.action.view.tooltip', 'View Brief')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(brief.id);
                    }}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition"
                    title={t('brief.action.duplicate.tooltip', 'Duplicate Brief')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(brief.id);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                    title={t('brief.action.delete.tooltip', 'Delete Brief')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BriefManagementGrid;
