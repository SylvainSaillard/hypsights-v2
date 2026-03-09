import React from 'react';

interface ScoreBarProps {
  score: number;
  label: string;
  explanation?: string;
  learnMoreLabel?: string;
  hideLabel?: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ 
  score, 
  label, 
  explanation,
  learnMoreLabel = 'Learn more',
  hideLabel = 'Hide'
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getColor = (s: number) => {
    if (s >= 90) return 'bg-green-500';
    if (s >= 75) return 'bg-blue-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700 w-28 flex-shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(score)} rounded-full transition-all duration-500`} 
            style={{ width: `${score}%` }} 
          />
        </div>
        <span className="text-xs font-mono w-8 text-right text-gray-600">{score}</span>
      </div>

      {explanation && (
        <div className="space-y-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors ml-28"
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{isExpanded ? hideLabel : learnMoreLabel}</span>
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-blue-50/50 border-l-4 border-indigo-400 pl-4 pr-3 py-3 rounded-r ml-28">
              <p className="text-xs text-gray-700 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBar;
