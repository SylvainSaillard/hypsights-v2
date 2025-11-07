import { useSuppliers } from '../../hooks/useSuppliers';
import SupplierCard from '../suppliers/SupplierCard';
import type { SupplierGroup } from '../../types/supplierTypes';
import { supabase } from '../../lib/supabaseClient';
import { FastSearchLoadingAnimation } from '../animations/FastSearchLoadingAnimation';

interface SuppliersFoundPanelProps {
  briefId: string;
  briefTitle?: string;
}

export function SuppliersFoundPanel({ briefId, briefTitle }: SuppliersFoundPanelProps) {
  const { suppliers, solutionGroups, isLoading, error, refresh } = useSuppliers(briefId);

  // Transformer les données existantes en format groupé par fournisseur
  const supplierGroups = transformToSupplierGroups(suppliers, solutionGroups);
  // Afficher tous les résultats (limite retirée)
  const limitedGroups = supplierGroups;

  const handleExportCSV = async () => {
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Please log in to export data.');
        return;
      }

      // Call the supplier export Edge Function
      const response = await fetch('/functions/v1/supplier-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'export_suppliers',
          brief_id: briefId,
          format: 'csv'
        })
      });

      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `suppliers-brief-${briefId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', await response.text());
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (isLoading && suppliers.length === 0) {
    return <FastSearchLoadingAnimation briefTitle={briefTitle} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-red-700 font-medium">Error loading suppliers</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => refresh()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (limitedGroups.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No suppliers found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or launch a new search.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Suppliers Found
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {limitedGroups.length} supplier{limitedGroups.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-white shadow-md border border-green-200 text-green-700 text-sm rounded-lg hover:bg-green-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => handleExportCSV()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          
          <button 
            className="px-4 py-2 bg-white shadow-md border border-purple-200 text-purple-700 text-sm rounded-lg hover:bg-purple-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => refresh()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Carrousel horizontal */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
          {limitedGroups.map((supplierGroup) => (
            <div key={supplierGroup.supplier.id} className="flex-shrink-0 w-96">
              <SupplierCard
                supplierGroup={supplierGroup}
                onViewDetails={(supplierId) => {
                  console.log('View details for supplier:', supplierId);
                }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Fonction pour transformer les données existantes en format groupé par fournisseur
function transformToSupplierGroups(_suppliers: any[], solutionGroups: any[]): SupplierGroup[] {
  const supplierMap = new Map<string, SupplierGroup>();

  // Parcourir tous les fournisseurs de toutes les solutions
  solutionGroups.forEach((solutionGroup) => {
    solutionGroup.suppliers.forEach((supplier: any) => {
      const supplierId = supplier.id;
      
      if (!supplierMap.has(supplierId)) {
        // Créer un nouveau groupe fournisseur
        supplierMap.set(supplierId, {
          supplier: {
            id: supplier.id,
            name: supplier.name,
            description: supplier.description,
            overview: supplier.company_overview || supplier.description || 'No overview available',
            country: supplier.country || 'N/A',
            region: getRegionFromCountry(supplier.country),
            company_size: supplier.company_size || 'N/A',
            company_type: supplier.company_type || 'N/A',
            website: supplier.website,
            created_at: supplier.created_at || new Date().toISOString(),
            brief_id: supplier.brief_id
          },
          solutions: [],
          scores: {
            solution_fit: 75, // Placeholder
            solution_fit_explanation: '',
            brief_fit: 85, // Placeholder
            brief_fit_explanation: '',
            criteria_match: 80, // Placeholder
            overall: supplier.overall_match_score || supplier.match_score || 78,
            geography_score: 1,
            company_size_score: 1,
            maturity_score: 1,
            organization_score: 1
          },
          ai_explanation: supplier.match_explanation || `${supplier.name} matches your requirements based on technical capabilities, market positioning, and delivery capacity.`,
          total_products: 0
        });
      }

      const supplierGroup = supplierMap.get(supplierId)!;
      
      // Ajouter la solution si elle n'existe pas déjà
      const existingSolution = supplierGroup.solutions.find(s => s.id === solutionGroup.solutionId);
      if (!existingSolution) {
        const products = supplier.products || [];
        
        supplierGroup.solutions.push({
          id: solutionGroup.solutionId,
          title: solutionGroup.solutionName,
          solution_number: solutionGroup.solutionNumber,
          products: products.map((product: any, index: number) => ({
            id: product.id || `${supplier.id}-product-${index}`,
            name: product.name || 'Unknown Product',
            description: product.product_description || '',
            created_at: product.created_at || new Date().toISOString(),
            metadata: product
          }))
        });
        
        supplierGroup.total_products += products.length;
      }
    });
  });

  // Convertir en array et trier par score global
  const groups = Array.from(supplierMap.values());
  return groups.sort((a, b) => b.scores.overall - a.scores.overall);
}

// Fonction utilitaire pour déterminer la région à partir du pays
function getRegionFromCountry(country?: string): string {
  if (!country) return 'N/A';
  
  const countryLower = country.toLowerCase();
  
  if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('canada')) {
    return 'North America';
  }
  if (countryLower.includes('france') || countryLower.includes('germany') || countryLower.includes('uk') || 
      countryLower.includes('spain') || countryLower.includes('italy') || countryLower.includes('europe')) {
    return 'Europe';
  }
  if (countryLower.includes('china') || countryLower.includes('japan') || countryLower.includes('korea') || 
      countryLower.includes('singapore') || countryLower.includes('asia')) {
    return 'Asia';
  }
  
  return 'Other';
}
