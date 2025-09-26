import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SupplierGroup } from '../../types/supplierTypes';
import { useSupplierProducts } from '../../hooks/useSupplierProducts';
import { FitScoreBlock } from './FitScoreBlock';
import { FileDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../hooks/use-toast';

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
  const { supplier, solutions, scores } = supplierGroup;
  const navigate = useNavigate();
  const { briefId } = useParams<{ briefId: string }>();
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();
  
  // Récupérer le vrai nombre de produits depuis la table products
  const { products } = useSupplierProducts({
    supplierId: supplier.id,
    briefId: briefId,
    enabled: true
  });

  const handleViewDetails = () => {
    if (briefId) {
      navigate(`/dashboard/briefs/${briefId}/suppliers/${supplier.id}`);
    } else if (onViewDetails) {
      onViewDetails(supplier.id);
    }
  };

  const handleExportPdf = async () => {
    if (!briefId) return;
    setIsExporting(true);
    toast({ title: 'Generating PDF...', description: 'Your supplier report is being created.' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/supplier-pdf-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ brief_id: briefId, supplier_id: supplier.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedSupplierName = supplier.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `supplier-report-${sanitizedSupplierName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: '✅ Success', description: 'PDF report downloaded successfully.' });

    } catch (error: any) {
      console.error('Failed to export PDF:', error);
      toast({ 
        title: '❌ Error',
        description: error.message || 'Could not generate the PDF report.',
        variant: 'destructive' 
      });
    } finally {
      setIsExporting(false);
    }
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
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200 hover:border-indigo-300 overflow-hidden relative group">
      {/* Bordure colorée en haut */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 group-hover:h-1.5 transition-all duration-300"></div>
      
      {/* Effet de brillance sur toute la carte */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 ease-out pointer-events-none"></div>
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
                    {solution.title && solution.title.length > 35 ? `${solution.title.substring(0, 35)}...` : (solution.title || 'No title')}
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
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-2 leading-tight truncate" title={supplier.name}>
                {supplier.name}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                {supplier.overview || supplier.description || 'No description available'}
              </p>
            </div>
            <div className="ml-4 text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="text-2xl font-bold">{scores.brief_fit}%</div>
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
            <div className="flex items-center gap-1 bg-white bg-opacity-20 rounded-full px-3 py-1">
              <span>📋</span>
              <span>{products.length} {products.length === 1 ? 'Product' : 'Products'}</span>
            </div>
            {supplier.url && (
              <a 
                href={supplier.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-300/30 rounded-full px-4 py-1.5 hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-blue-200">🌐</span>
                <span className="font-medium text-blue-100">Visit Website</span>
                <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-6">


        {/* Hypsights AI Analysis */}
        <div className="mb-6">
          <FitScoreBlock 
            title="Hypsights AI Analysis"
            score={null}
            explanation={scores.brief_fit_explanation}
            color="green"
          />
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
                    scores.geography_score === 2 ? 'bg-green-500' : 
                    scores.geography_score === 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">{supplier.region || supplier.country || 'Global'}</div>
              </div>
              
              {/* Type d'organisation */}
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Organization</span>
                  <div className={`w-3 h-3 rounded-full ${
                    scores.organization_score === 2 ? 'bg-green-500' : 
                    scores.organization_score === 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600">{supplier.company_type || 'Private'}</div>
              </div>
            </div>
          </div>
        )}


        {/* Résumé des produits - Design amélioré */}
        {products.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-lg">📦</span>
                </div>
                <div>
                  <div className="text-base font-bold text-gray-800">
                    {products.length} Product{products.length !== 1 ? 's' : ''} Available
                  </div>
                  <p className="text-sm text-gray-600">
                    Across {solutions.length} solution{solutions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-xs text-gray-500">Items</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleViewDetails}
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
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export as PDF"
          >
            {isExporting ? (
              <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FileDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;
