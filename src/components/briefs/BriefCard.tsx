import React from 'react';
import { useEdgeFunction } from '../../hooks/useEdgeFunction';

// Define the types for the brief and stats
interface Brief {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  created_at: string;
}

interface BriefStats {
  solutions: number;
  suppliers: number;
  products: number;
}

interface BriefCardProps {
  brief: Brief;
}

const BriefCard: React.FC<BriefCardProps> = ({ brief }) => {
  const { data: stats, loading, error } = useEdgeFunction<BriefStats>('dashboard-data', {
    action: 'get_brief_stats',
    brief_id: brief.id
  }, [brief.id]);

  const hasResults = stats && (stats.solutions > 0 || stats.suppliers > 0 || stats.products > 0);
  const cardClasses = hasResults
    ? 'bg-white border-green-500'
    : 'bg-gray-100 border-gray-300';

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${cardClasses}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasResults ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-800'}`}>
          {hasResults ? 'Deep Search Requested' : 'Draft'}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-1">{brief.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{brief.description}</p>
      <div className="flex items-center text-xs text-gray-500 space-x-4 mb-4">
        <span>{brief.category}</span>
        <span>{brief.budget}</span>
        <span>{timeAgo(brief.created_at)}</span>
      </div>

      {loading && <p>Loading stats...</p>}
      {error && <p className="text-red-500">Error loading stats.</p>}
      {stats && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-bold text-xl">{stats.suppliers}</p>
            <p className="text-sm text-gray-500">Companies</p>
          </div>
          <div>
            <p className="font-bold text-xl">{stats.products}</p>
            <p className="text-sm text-gray-500">Products</p>
          </div>
          <div>
            <p className="font-bold text-xl">{stats.solutions}</p>
            <p className="text-sm text-gray-500">Solutions</p>
          </div>
        </div>
      )}

      <button className={`w-full mt-4 py-2 rounded-lg font-semibold ${hasResults ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
        {hasResults ? 'View Results' : 'Complete & Submit Brief'}
      </button>
    </div>
  );
};

export default BriefCard;
