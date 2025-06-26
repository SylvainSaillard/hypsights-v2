import React from 'react';
import { CheckCircle, AlertTriangle, Info, TrendingUp, Box, Truck, Globe } from 'react-feather';

// Define the structure for the supplier match data based on the view created
export interface SupplierMatch {
  supplier_id: string;
  supplier_name: string;
  description?: string;
  website?: string;
  country?: string;
  company_overview?: string;
  logo_url?: string;
  brief_id: string;
  solution_id?: string;
  overall_match_score: number;
  technical_fit_score: number;
  market_relevance_score: number;
  delivery_capacity_score: number;
  sustainability_score: number;
  match_explanation?: string;
  match_insights?: {
    strong: string[];
    moderate: string[];
    weak: string[];
  };
  is_top_match?: boolean;
  updated_at: string;
}

interface SupplierMatchCardProps {
  match: SupplierMatch;
}

// Helper component for criteria tags at the top
const CriteriaTag: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="bg-gray-700 text-white px-4 py-1.5 rounded-full text-sm font-medium">
    {label} <span className="font-bold text-gray-300">{score}</span>
  </div>
);

// Helper component for the progress bar and score
const MatchScoreBar: React.FC<{
  icon: React.ReactNode;
  label: string;
  score: number;
}> = ({ icon, label, score }) => {
  const getScoreStyle = (s: number): { bar: string; text: string; description: string } => {
    if (s >= 85) return { bar: 'bg-green-500', text: 'text-green-300', description: 'Excellent match for your requirements' };
    if (s >= 70) return { bar: 'bg-yellow-500', text: 'text-yellow-300', description: 'Good match, with minor gaps' };
    if (s >= 50) return { bar: 'bg-orange-500', text: 'text-orange-300', description: 'Moderate match, some gaps identified' };
    return { bar: 'bg-red-500', text: 'text-red-300', description: 'Weak match, significant gaps' };
  };

  const style = getScoreStyle(score);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="text-gray-400 mr-3">{icon}</div>
          <h4 className="font-semibold text-white">{label}</h4>
        </div>
        <Info size={16} className="text-gray-500" />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-white">{score}%</div>
        <div className="w-full">
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className={`${style.bar} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
          </div>
          <p className={`text-xs ${style.text} mt-1`}>{style.description}</p>
        </div>
      </div>
    </div>
  );
};

// Helper component for match insights
const MatchInsightItem: React.FC<{ text: string; type: 'strong' | 'moderate' | 'weak' }> = ({ text, type }) => {
  const icons = {
    strong: <CheckCircle size={18} className="text-green-400" />,
    moderate: <AlertTriangle size={18} className="text-yellow-400" />,
    weak: <AlertTriangle size={18} className="text-red-400" />,
  };
  const colors = {
    strong: 'text-green-300',
    moderate: 'text-yellow-300',
    weak: 'text-red-300',
  }

  return (
    <li className="flex items-start gap-3">
      <div className="mt-1">{icons[type]}</div>
      <span className={colors[type]}>{text}</span>
    </li>
  );
};

const SupplierMatchCard: React.FC<SupplierMatchCardProps> = ({ match }) => {
  return (
    <div className="bg-gray-900 text-gray-300 p-6 rounded-2xl shadow-2xl border border-gray-700 font-sans">
      {/* Header with matching criteria */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Matching Criteria</h3>
        <div className="flex flex-wrap gap-3">
          <CriteriaTag label="Technical Fit" score={match.technical_fit_score} />
          <CriteriaTag label="Market Relevance" score={match.market_relevance_score} />
          <CriteriaTag label="Delivery Capacity" score={match.delivery_capacity_score} />
          <CriteriaTag label="Sustainability" score={match.sustainability_score} />
        </div>
      </div>

      {/* Match Profile Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
                <Info size={20} className="mr-2 text-blue-400"/>
                Match Profile
            </h3>
            <div className="bg-blue-500 text-white text-lg font-bold px-4 py-2 rounded-lg">
                {match.overall_match_score}% Match
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MatchScoreBar
            icon={<Box size={24} />}
            label="Technical Fit"
            score={match.technical_fit_score}
          />
          <MatchScoreBar
            icon={<TrendingUp size={24} />}
            label="Market Relevance"
            score={match.market_relevance_score}
          />
          <MatchScoreBar
            icon={<Truck size={24} />}
            label="Delivery Capacity"
            score={match.delivery_capacity_score}
          />
          <MatchScoreBar
            icon={<Globe size={24} />}
            label="Sustainability"
            score={match.sustainability_score}
          />
        </div>
      </div>

      {/* Why this supplier fits */}
      <div className="bg-blue-900 bg-opacity-30 p-5 rounded-lg border border-blue-700 mb-6">
        <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Info size={20} className="mr-2 text-blue-400"/>
            Why this supplier fits your needs
        </h4>
        <p className="text-blue-200 mb-3">{match.match_explanation || 'No explanation provided.'}</p>
        <div className="flex justify-between items-center text-xs text-gray-400">
            <a href="#" className="hover:text-white underline">Read full analysis ↗</a>
            <span>Validated by Hypsights AI</span>
            <span>Updated {new Date(match.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Match Insights */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Match Insights:</h3>
        <ul className="space-y-2">
          {match.match_insights?.strong?.map(insight => <MatchInsightItem key={insight} text={insight} type="strong" />)}
          {match.match_insights?.moderate?.map(insight => <MatchInsightItem key={insight} text={insight} type="moderate" />)}
          {match.match_insights?.weak?.map(insight => <MatchInsightItem key={insight} text={insight} type="weak" />)}
        </ul>
      </div>
    </div>
  );
};

export default SupplierMatchCard;