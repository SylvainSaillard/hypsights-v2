import React from 'react';

interface FitScoreBlockProps {
  title: string;
  score: number | null;
  explanation: string;
  color: 'blue' | 'green';
}

const colorStyles = {
  blue: {
    text: 'text-blue-400',
    barBg: 'bg-blue-900',
    barFill: 'bg-blue-500',
    iconBorder: 'border-blue-500',
    iconText: 'text-blue-300',
  },
  green: {
    text: 'text-green-400',
    barBg: 'bg-green-900',
    barFill: 'bg-green-500',
    iconBorder: 'border-green-500',
    iconText: 'text-green-300',
  },
};

export const FitScoreBlock: React.FC<FitScoreBlockProps> = ({ title, score, explanation, color }) => {
  const styles = colorStyles[color];

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-white text-lg">{title}</h4>
        {score !== null && (
          <div className={`text-2xl font-bold ${styles.text}`}>{score}%</div>
        )}
      </div>
      {score !== null && (
        <div className={`w-full ${styles.barBg} rounded-full h-2 mb-4`}>
          <div className={`${styles.barFill} h-2 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
      )}
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 ${styles.iconBorder} flex items-center justify-center mr-3`}>
          <span className={`font-bold text-sm ${styles.iconText}`}>AI</span>
        </div>
        <p className="text-gray-300 text-sm">
          {explanation}
        </p>
      </div>
    </div>
  );
};
