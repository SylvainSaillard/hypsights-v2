import React, { useState } from 'react';
import type { SupplierGroup } from '../../types/supplierTypes';

interface SupplierCardProps {
  supplierGroup: SupplierGroup;
  onViewDetails?: (supplierId: string) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ 
  supplierGroup, 
  onViewDetails 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { supplier, solutions, scores, ai_explanation, total_products } = supplierGroup;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getCompanySizeIcon = (size?: string) => {
    switch (size?.toLowerCase()) {
      case 'startup':
        return '🚀';
      case 'sme':
      case 'small':
        return '🏢';
      case 'large':
      case 'enterprise':
        return '🏭';
      default:
        return '🏢';
    }
  };

  const getRegionFlag = (region?: string) => {
    switch (region?.toLowerCase()) {
      case 'usa':
      case 'us':
        return '🇺🇸';
      case 'eu':
      case 'europe':
        return '🇪🇺';
      case 'asia':
        return '🌏';
      case 'africa':
        return '🌍';
      default:
        return '🌐';
    }
  };

  // Fonction pour obtenir une couleur unique pour chaque solution
  const getSolutionBadgeColor = (solutionNumber?: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-cyan-500'
    ];
    
    if (!solutionNumber) return 'bg-gray-500';
    return colors[(solutionNumber - 1) % colors.length] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Badges des solutions associées */}
      {solutions.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {solutions.map((solution) => (
              <div 
                key={solution.id}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${
                  getSolutionBadgeColor(solution.solution_number)
                }`}
              >
                <span className="mr-1">✓</span>
                Solution {solution.solution_number || '?'}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 leading-tight">
                {supplier.name}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {supplier.overview || supplier.description || 'No description available'}
              </p>
            </div>
            <div className="ml-4 text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="text-2xl font-bold">{scores.overall}%</div>
                <div className="text-xs opacity-90">Overall Match</div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span>{getRegionFlag(supplier.region)}</span>
              <span>{supplier.country || supplier.region || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span>{getCompanySizeIcon(supplier.company_size)}</span>
              <span>{supplier.company_size || supplier.company_type || 'N/A'}</span>
            </div>
            {supplier.website && (
              <a 
                href={supplier.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1 hover:bg-opacity-30 transition-colors"
              >
                <span>🔗</span>
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-6">
        {/* Scores détaillés */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {scores.solution_fit && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Solution Fit</div>
              <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(scores.solution_fit)} transition-all duration-500`}
                  style={{ width: `${scores.solution_fit}%` }}
                ></div>
              </div>
              <div className="text-sm font-semibold mt-1">{scores.solution_fit}%</div>
            </div>
          )}
          {scores.brief_fit && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Brief Fit</div>
              <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(scores.brief_fit)} transition-all duration-500`}
                  style={{ width: `${scores.brief_fit}%` }}
                ></div>
              </div>
              <div className="text-sm font-semibold mt-1">{scores.brief_fit}%</div>
            </div>
          )}
          {scores.criteria_match && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Criteria Match</div>
              <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreColor(scores.criteria_match)} transition-all duration-500`}
                  style={{ width: `${scores.criteria_match}%` }}
                ></div>
              </div>
              <div className="text-sm font-semibold mt-1">{scores.criteria_match}%</div>
            </div>
          )}
        </div>

        {/* Explication IA */}
        {ai_explanation && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🧠</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">AI Analysis</div>
                <p className="text-sm text-gray-600 leading-relaxed">{ai_explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Solutions et produits */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-800">
              Solutions & Products ({total_products} products)
            </h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Aperçu des solutions */}
          <div className="space-y-2">
            {solutions.slice(0, isExpanded ? solutions.length : 2).map((solution) => (
              <div key={solution.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">
                      {solution.solution_number ? `Solution #${solution.solution_number}` : solution.title}
                    </div>
                    {solution.solution_number && (
                      <div className="text-sm text-gray-600 mt-1">{solution.title}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {solution.products.length} product{solution.products.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {!isExpanded && solutions.length > 2 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{solutions.length - 2} more solutions
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onViewDetails?.(supplier.id)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View Details
          </button>
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;
