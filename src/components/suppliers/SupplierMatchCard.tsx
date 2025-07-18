import React from 'react';
import { Star, CheckCircle, Key, Briefcase, Share2, ExternalLink, Info, TrendingUp, Truck, Globe } from 'react-feather';

// Updated data structure for the supplier match
export interface SupplierMatch {
  supplier_id: string;
  supplier_name: string;
  description?: string; // Used as subtitle, e.g., "High-End Laptops & Workstations"
  website?: string;
  country?: string;
  company_overview?: string;
  logo_url?: string;
  available_products?: string[];
  key_features?: string[];
  brief_id: string;
  solution_id?: string;
  solution_name?: string;
  overall_match_score: number;
  technical_fit_score: number;
  market_relevance_score: number;
  delivery_capacity_score: number;
  sustainability_score: number;
  match_explanation?: string;
  match_insights?: { strong: string[]; moderate: string[]; weak: string[]; };
  is_top_match?: boolean;
  updated_at: string;
}

interface SupplierMatchCardProps { match: SupplierMatch; }

// --- HELPER COMPONENTS --- //

const CriteriaTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
    {label} <span className="font-bold text-gray-900">{score}</span>
  </div>
);

const MatchScoreBar: React.FC<{ icon: React.ReactNode; label: string; score: number; }> = ({ icon, label, score }) => {
  const getScoreStyle = (s: number) => {
    if (s >= 85) return { bar: 'bg-green-500', text: 'text-green-300', desc: 'Excellent match' };
    if (s >= 70) return { bar: 'bg-yellow-500', text: 'text-yellow-300', desc: 'Good match' };
    return { bar: 'bg-orange-500', text: 'text-orange-300', desc: 'Moderate match' };
  };
  const style = getScoreStyle(score);
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center mb-2">
        <div className="text-gray-400 mr-3">{icon}</div>
        <h4 className="font-semibold text-white">{label}</h4>
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-4xl font-bold ${style.text}`}>{score}%</div>
        <div className="text-sm text-gray-400 ml-3 pb-1 leading-tight">{style.desc}</div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
        <div className={`${style.bar} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT --- //

const SupplierMatchCard: React.FC<SupplierMatchCardProps> = ({ match }) => {
  return (
    <div className="font-sans rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
      {/* TOP BANNER */}
      {match.solution_name && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-semibold px-6 py-2 flex items-center">
          <Info size={14} className="mr-2" />
          Matched from Solution: {match.solution_name}
        </div>
      )}

      {/* SUPPLIER IDENTITY SECTION (WHITE) */}
      <div className="bg-white text-gray-800 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-1">
              {match.website ? (
                <a href={match.website} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold mr-3 text-gray-800 hover:text-blue-600 hover:underline transition-colors">
                  {match.supplier_name}
                </a>
              ) : (
                <h2 className="text-2xl font-bold mr-3">{match.supplier_name}</h2>
              )}
              {match.is_top_match && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <Star size={12} className="mr-1.5" /> Top Match
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium">{match.description}</p>
          </div>
          <div className="text-center bg-gray-800 text-white rounded-lg px-5 py-3">
            <div className="text-4xl font-bold">{match.overall_match_score}%</div>
            <div className="text-xs font-semibold tracking-wider">MATCH SCORE</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600"><CheckCircle size={14} className="mr-2 text-green-600"/>Available Products</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {match.available_products?.map((product, i) => <li key={i}>{product}</li>) ?? <li>Not specified</li>}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600"><Key size={14} className="mr-2 text-yellow-600"/>Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {match.key_features?.map((feature, i) => (
                <span key={i} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{feature}</span>
              )) ?? <span className="text-xs text-gray-500">Not specified</span>}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600"><Briefcase size={14} className="mr-2 text-indigo-600"/>Company Overview</h3>
            <p className="text-sm text-gray-700">{match.company_overview || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black">
            <Share2 size={16} /> Share
          </button>
          <a href={match.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            View Details <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* MATCHING DETAILS SECTION (DARK) */}
      <div className="bg-gray-900 text-gray-300 p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Matching Criteria</h3>
          <div className="flex flex-wrap gap-3">
            <CriteriaTag label="Technical Fit" score={match.technical_fit_score} />
            <CriteriaTag label="Market Relevance" score={match.market_relevance_score} />
            <CriteriaTag label="Delivery Capacity" score={match.delivery_capacity_score} />
            <CriteriaTag label="Sustainability" score={match.sustainability_score} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center mb-4">
            Match Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MatchScoreBar icon={<TrendingUp size={24} />} label="Technical Fit" score={match.technical_fit_score} />
            <MatchScoreBar icon={<TrendingUp size={24} />} label="Market Relevance" score={match.market_relevance_score} />
            <MatchScoreBar icon={<Truck size={24} />} label="Delivery Capacity" score={match.delivery_capacity_score} />
            <MatchScoreBar icon={<Globe size={24} />} label="Sustainability" score={match.sustainability_score} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMatchCard;