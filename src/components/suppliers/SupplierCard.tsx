import React from 'react';
import type { SupplierGroup } from '../../types/supplierTypes';

interface SupplierCardProps {
  supplierGroup: SupplierGroup;
  onViewDetails?: (supplierId: string) => void;
  onSolutionSelect?: (solutionNumber: number) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ 
  supplierGroup, 
  onViewDetails,
  onSolutionSelect
}) => {
  const { supplier, solutions, scores, ai_explanation, total_products } = supplierGroup;

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

  // Fonction pour obtenir les couleurs des solutions
  const getSolutionColors = () => {
    const colorMap = {
      1: '#3B82F6', // blue-500
      2: '#10B981', // emerald-500  
      3: '#8B5CF6', // violet-500
      4: '#F59E0B', // amber-500
      5: '#EF4444', // red-500
      6: '#6366F1', // indigo-500
      7: '#06B6D4', // cyan-500
      8: '#84CC16', // lime-500
      9: '#F97316', // orange-500
      10: '#EC4899' // pink-500
    };
    
    return solutions.map(solution => ({
      number: solution.solution_number || 0,
      title: solution.title,
      color: colorMap[(((solution.solution_number || 1) - 1) % 10 + 1) as keyof typeof colorMap] || '#6B7280'
    }));
  };
  
  const solutionColors = getSolutionColors();
  
  // Créer le style de background pour la barre du haut
  const getHeaderStyle = () => {
    if (solutionColors.length === 0) return { backgroundColor: '#6B7280' };
    if (solutionColors.length === 1) {
      return { backgroundColor: solutionColors[0].color };
    }
    // Gradient pour plusieurs solutions
    const gradientColors = solutionColors.map(s => s.color).join(', ');
    return { background: `linear-gradient(90deg, ${gradientColors})` };
  };
  


  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Barre de solution intégrée avec couleurs distinctes */}
      {solutions.length > 0 && (
        <div 
          className="w-full py-3 px-6 text-white relative overflow-hidden"
          style={getHeaderStyle()}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              {solutionColors.map((solution, index) => (
                <div 
                  key={index}
                  className="flex flex-col cursor-pointer rounded-lg py-2 px-3 hover:bg-white/20 transition-all duration-200"
                  title={`Filter by: ${solution.title}`}
                  onClick={() => onSolutionSelect?.(solution.number)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">✓</span>
                    <span className="text-sm font-semibold">
                      Solution {solution.number}
                    </span>
                  </div>
                  <span className="text-xs opacity-80 mt-0.5 leading-tight">
                    {solution.title.length > 35 ? `${solution.title.substring(0, 35)}...` : solution.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Effet de brillance subtil - gardé car très sympa */}
          <div className="absolute top-0 right-0 w-32 h-full bg-white opacity-10 transform skew-x-12"></div>
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
        {/* Scores principaux avec design moderne */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {scores.solution_fit && (
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-5 overflow-hidden">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="text-white font-bold mb-4 flex items-center gap-3">
                  <div className="w-2 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
                  <span className="text-base">Solution Fit</span>
                  <div className="ml-auto text-xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                    {scores.solution_fit}%
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.solution_fit}%` }}
                  ></div>
                </div>
                
                {/* Encart explication IA */}
                <div className="bg-black/20 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black text-xs font-bold">AI</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Strong alignment with your solution requirements. The supplier's capabilities directly address your core needs with proven expertise in this domain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {scores.brief_fit && (
            <div className="relative bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-2xl p-5 overflow-hidden">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
              
              <div className="relative z-10">
                <div className="text-white font-bold mb-4 flex items-center gap-3">
                  <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-400 rounded-full"></div>
                  <span className="text-base">Brief Fit</span>
                  <div className="ml-auto text-xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text">
                    {scores.brief_fit}%
                  </div>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.brief_fit}%` }}
                  ></div>
                </div>
                
                {/* Encart explication IA */}
                <div className="bg-black/20 rounded-lg p-3 border border-emerald-500/20">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-black text-xs font-bold">AI</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Excellent match with your original brief specifications. The supplier meets your stated requirements and project scope effectively.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Critères individuels - Design épuré */}
        {scores.criteria_match && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 mb-6 border border-gray-200">
            <div className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <span>Criteria Assessment</span>
              <div className="ml-auto text-lg font-black text-indigo-600">
                {scores.criteria_match}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Géographie */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Geography</span>
                  <div className={`w-3 h-3 rounded-full ${
                    (scores.criteria_match >= 75) ? 'bg-green-500' : 
                    (scores.criteria_match >= 50) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">{supplier.region || supplier.country || 'Global'}</div>
              </div>
              
              {/* Taille */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Company Size</span>
                  <div className={`w-3 h-3 rounded-full ${
                    (scores.criteria_match >= 70) ? 'bg-green-500' : 
                    (scores.criteria_match >= 45) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">{supplier.company_size || 'Medium'}</div>
              </div>
              
              {/* Maturité */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Maturity</span>
                  <div className={`w-3 h-3 rounded-full ${
                    (scores.criteria_match >= 65) ? 'bg-green-500' : 
                    (scores.criteria_match >= 40) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">Established</div>
              </div>
              
              {/* Type d'organisation */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Organization</span>
                  <div className={`w-3 h-3 rounded-full ${
                    (scores.criteria_match >= 60) ? 'bg-green-500' : 
                    (scores.criteria_match >= 35) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">{supplier.company_type || 'Private'}</div>
              </div>
            </div>
          </div>
        )}

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

        {/* Résumé des produits */}
        {total_products > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">📦</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {total_products} Product{total_products !== 1 ? 's' : ''} Available
                </div>
                <p className="text-xs text-gray-600">
                  Across {solutions.length} solution{solutions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

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
