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

interface BriefCardProps {
  brief: Brief;
}

const IconTag = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM15 5h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2V7a2 2 0 012-2zM7 15h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2zM15 15h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>;
const IconDollar = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4z" /></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconCompany = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h5a2 2 0 012 2v4m-6 0v-2a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>;
const IconProduct = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconSolution = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconStar = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

const BriefCard: React.FC<BriefCardProps> = ({ brief }) => {
  const { data: statsData, loading, error } = useEdgeFunction('dashboard-data', {
    action: 'get_brief_stats',
    brief_id: brief.id
  }, 'POST');

  const stats = statsData?.stats;
  const hasResults = stats && (stats.solutions > 0 || stats.suppliers > 0 || stats.products > 0);
  
  const cardClasses = hasResults
    ? 'border-green-300 bg-green-50/50 shadow-lg'
    : 'border-gray-200 bg-white';

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
    <div className={`p-6 rounded-xl border-2 flex flex-col h-full ${cardClasses}`}>
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${hasResults ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
          {hasResults ? 'Deep Search Requested' : 'Draft'}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-2 text-gray-800">{brief.title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{brief.description}</p>
      
      <div className="flex items-center text-xs text-gray-500 space-x-4 mb-5">
        <span className="flex items-center"><IconTag /> {brief.category}</span>
        <span className="flex items-center"><IconDollar /> {brief.budget}</span>
        <span className="flex items-center"><IconCalendar /> {timeAgo(brief.created_at)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-5">
        <div className={`rounded-lg p-3 ${hasResults ? 'bg-green-100/60' : 'bg-gray-100'}`}>
          <IconCompany />
          <p className="font-bold text-2xl text-gray-700">{loading ? '...' : hasResults ? stats.suppliers : '-'}</p>
          <p className="text-xs text-gray-500">Companies</p>
        </div>
        <div className={`rounded-lg p-3 ${hasResults ? 'bg-green-100/60' : 'bg-gray-100'}`}>
          <IconProduct />
          <p className="font-bold text-2xl text-gray-700">{loading ? '...' : hasResults ? stats.products : '-'}</p>
          <p className="text-xs text-gray-500">Products</p>
        </div>
        <div className={`rounded-lg p-3 ${hasResults ? 'bg-green-100/60' : 'bg-gray-100'}`}>
          <IconSolution />
          <p className="font-bold text-2xl text-gray-700">{loading ? '...' : hasResults ? stats.solutions : '-'}</p>
          <p className="text-xs text-gray-500">Solutions</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs text-center mb-4">Error loading stats.</p>}

      <button className={`w-full mt-auto py-2.5 rounded-lg font-semibold flex items-center justify-center transition-all ${hasResults ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}>
        {hasResults ? <><IconStar /> View New Results</> : 'Complete & Submit Brief'}
      </button>
    </div>
  );
};

export default BriefCard;
