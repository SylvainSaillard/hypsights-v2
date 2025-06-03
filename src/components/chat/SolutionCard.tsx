import React from 'react';

export interface Solution {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  match_score: number;
  is_validated: boolean;
}

interface SolutionCardProps {
  solution: Solution;
  onValidate: () => Promise<void>;
  isValidating: boolean;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onValidate, isValidating }) => {
  // Helper function to determine badge color based on match score
  const getMatchScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${
      solution.is_validated ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary'
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">{solution.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getMatchScoreBadgeColor(solution.match_score)
          }`}>
            {solution.match_score}% Match
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{solution.description}</p>
        
        {solution.capabilities.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Capabilities:</p>
            <div className="flex flex-wrap gap-1">
              {solution.capabilities.map(capability => (
                <span 
                  key={capability} 
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        )}

        {solution.is_validated ? (
          <div className="flex items-center text-green-700 text-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1.5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            Validated
          </div>
        ) : (
          <button
            onClick={onValidate}
            disabled={isValidating}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md transition ${
              isValidating 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:scale-105'
            }`}
          >
            {isValidating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
            ) : (
              'Validate Solution'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SolutionCard;
