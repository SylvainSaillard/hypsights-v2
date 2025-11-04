import React from 'react';
import { Star, CheckCircle, Share2, Briefcase, MapPin, Globe, Info, Key, ExternalLink } from 'react-feather';

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
  solution_number?: number;
  overall_match_score: number;
  match_explanation?: string;
  match_insights?: { strong: string[]; moderate: string[]; weak: string[]; };
  is_top_match?: boolean;
  updated_at: string;
}

interface SupplierMatchCardProps { match: SupplierMatch; }



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
          {/* Overall Match Score - Masqué temporairement */}
          {/* <div className="text-center bg-gray-800 text-white rounded-lg px-5 py-3">
            <div className="text-4xl font-bold">{match.overall_match_score}%</div>
            <div className="text-xs font-semibold tracking-wider">MATCH SCORE</div>
          </div> */}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600"><CheckCircle size={14} className="mr-2 text-green-600"/>Available Products</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {match.available_products?.map((product, i) => (
              <li key={i}>{typeof product === 'string' ? product : (product as any)?.name || 'Unknown Product'}</li>
            )) ?? <li>Not specified</li>}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600"><Key size={14} className="mr-2 text-yellow-600"/>Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {match.key_features?.map((feature, i) => (
                <span key={i} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {typeof feature === 'string' ? feature : (feature as any)?.name || 'Unknown Feature'}
                </span>
              )) ?? <span className="text-xs text-gray-500">Not specified</span>}
            </div>
          </div>
          <div className="w-1/2 pl-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl h-full border border-gray-700 shadow-lg">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center">
                <Briefcase size={16} className="mr-2 text-blue-400" /> Company Overview
              </h4>
              <div className="space-y-3">
                {match.country && (
                  <div className="flex items-center p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-colors duration-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <MapPin size={14} className="text-green-400" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Location</span>
                      <span className="text-sm font-medium text-white">{match.country}</span>
                    </div>
                  </div>
                )}
                {match.website && (
                  <div className="flex items-center p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-colors duration-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      <Globe size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-400 block">Website</span>
                      <a 
                        href={match.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline transition-colors duration-200 truncate block"
                      >
                        {match.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                      </a>
                    </div>
                  </div>
                )}
                {match.company_overview && (
                  <div className="p-3 rounded-lg bg-gray-700/30 border-l-4 border-purple-400">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Info size={14} className="text-purple-400" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block mb-1">Description</span>
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {match.company_overview}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            {/* Criteria tags removed as data is no longer available */}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center mb-4">
            Match Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score bars removed as data is no longer available */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMatchCard;