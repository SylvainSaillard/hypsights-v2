import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';

// --- TYPE DEFINITIONS ---
type Brief = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  solutions_count: number;
  companies_count: number;
  products_count: number;
};

// --- HELPER COMPONENTS ---

const StatCard = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) => (
  <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
    <div className="flex justify-center items-center h-8 mb-2 text-gray-500">{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{count > 0 ? count : '-'}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const BriefCard = ({ brief }: { brief: Brief }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const isActive = brief.solutions_count > 0 || brief.companies_count > 0 || brief.products_count > 0;

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div 
      className={`border-2 rounded-xl p-5 flex flex-col justify-between transition-shadow hover:shadow-lg cursor-pointer ${isActive ? 'border-green-400 bg-green-50/30' : 'bg-white'}`}
      onClick={() => navigate(`/dashboard/briefs/${brief.id}/chat`)}
    >
      <div>
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900">{brief.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{brief.description}</p>
        </div>
        <div className="text-xs text-gray-500 mb-4">{timeAgo(brief.created_at)}</div>
        
        <div className="flex gap-3 mb-5">
          <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V21H9z" /></svg>}
            label={t('brief.card.companies', 'Companies')}
            count={brief.companies_count} 
          />
          <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            label={t('brief.card.products', 'Products')}
            count={brief.products_count}
          />
          <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            label={t('brief.card.solutions', 'Solutions')}
            count={brief.solutions_count} 
          />
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (isActive) {
            navigate(`/dashboard/briefs/${brief.id}/search`);
          } else {
            navigate(`/dashboard/briefs/${brief.id}/chat`);
          }
        }}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-transform transform hover:scale-105 ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
        {isActive ? t('brief.card.view_results', 'View Results') : t('brief.card.complete_brief', 'Complete & Submit Brief')}
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

const BriefManagementGrid: React.FC = () => {
  const { t } = useI18n();
  const { data, loading, error } = useEdgeFunction('brief-operations', { action: 'list_briefs' }, 'POST');

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">{t('brief.grid.title.main', 'Your Briefs')}</h2>
        <p className="text-gray-500 mb-6">{t('brief.grid.subtitle', 'Select a brief to view its details and progress')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{t('brief.grid.error.load_failed', 'Failed to load briefs:')} {error}</div>;
  }

  const briefs = data?.briefs || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">{t('brief.grid.title.main', 'Your Briefs')}</h2>
      <p className="text-gray-500 mb-6">{t('brief.grid.subtitle', 'Select a brief to view its details and progress')}</p>

      {briefs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">{t('brief.empty.title', 'No Briefs Yet')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('brief.empty.message', "Get started by creating your first brief.")}</p>
          <Link to="/dashboard/briefs/new" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md">
            {t('brief.empty.create_button', 'Create Brief')}
          </Link>
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

