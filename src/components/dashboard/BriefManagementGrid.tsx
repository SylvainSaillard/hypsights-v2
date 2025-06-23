import React from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import BriefCard from '../briefs/BriefCard';

// Updated Brief type to reflect the data structure used by BriefCard
// Note: The 'status' field is removed as it's no longer used for display logic.
// The card's appearance is now determined by the presence of results (solutions, suppliers, products).
type Brief = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  created_at: string;
};

/**
 * BriefManagementGrid component
 * Displays a grid of BriefCards, providing a high-level overview of all user briefs.
 * This component has been refactored to use the new BriefCard component for a consistent and modern UI.
 */
const BriefManagementGrid: React.FC = () => {
  const { t } = useI18n();
  
  // Fetch all briefs for the current user.
  // The 'list_briefs' action is called to retrieve the necessary data.
  const { data, loading, error } = useEdgeFunction('brief-operations', { 
    action: 'list_briefs' 
  }, 'POST');

  // Display a loading skeleton to improve user experience while data is being fetched.
  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">{t('brief.grid.title.main', 'Your Briefs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-4 h-10 bg-gray-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Display an error message if the briefs fail to load.
  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-red-600">{t('brief.grid.title.error', 'Error Loading Briefs')}</h2>
        <p className="text-red-500">{error.message || t('error.generic', 'An unexpected error occurred.')}</p>
      </div>
    );
  }

  const briefs = data?.briefs || [];

  // Render the grid of brief cards.
  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">{t('brief.grid.title.main', 'Your Briefs')}</h2>
      
      {briefs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('brief.grid.empty', 'You have no briefs yet.')}</p>
          <p className="text-gray-500">{t('brief.grid.empty.cta', 'Create one to get started!')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefs.map((brief: Brief) => (
            <BriefCard key={brief.id} brief={brief} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BriefManagementGrid;
