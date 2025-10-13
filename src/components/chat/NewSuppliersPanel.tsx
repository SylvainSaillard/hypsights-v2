// Imports supprimés pour le test simple

import { useState, useMemo } from 'react';
import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import SupplierCarousel from '../suppliers/SupplierCarousel';
import { FastSearchLoadingAnimation } from '../animations/FastSearchLoadingAnimation';
import { supabase } from '../../lib/supabaseClient';

interface NewSuppliersPanelProps {
  briefId: string;
  briefTitle: string;
}

export function NewSuppliersPanel({ briefId, briefTitle }: NewSuppliersPanelProps) {
  const { supplierGroups, isLoading, error } = useSupplierGroups({ briefId });
  const [selectedSolutionNumber, setSelectedSolutionNumber] = useState<number | 'all'>('all');
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingXLSX, setIsExportingXLSX] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (format === 'csv') {
      setIsExportingCSV(true);
    } else {
      setIsExportingXLSX(true);
    }
    try {
      
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Please log in to export data.');
        return;
      }

      // Call the supplier export Edge Function
      const response = await fetch('https://lmqagaenmseopcctkrwv.supabase.co/functions/v1/supplier-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'export_suppliers',
          brief_id: briefId,
          format: format
        })
      });

      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `suppliers-${briefTitle.replace(/\s+/g, '-').toLowerCase()}.${format}`; // Dynamic fallback with title

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          } else {
            console.warn('Could not extract filename from Content-Disposition:', contentDisposition);
          }
        } else {
            console.warn('Content-Disposition header not found.');
        }
        
        link.download = filename;
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
    } finally {
      if (format === 'csv') {
        setIsExportingCSV(false);
      } else {
        setIsExportingXLSX(false);
      }
    }
  };

  // Créer une liste unique de toutes les solutions pour le filtre
  const allSolutions = useMemo(() => {
    const solutionsMap = new Map<string, { id: string; name: string; number: number }>();
    supplierGroups.forEach(group => {
      group.solutions.forEach(solution => {
        if (!solutionsMap.has(solution.id)) {
          solutionsMap.set(solution.id, {
            id: solution.id,
            name: solution.title,
            number: solution.solution_number || 0
          });
        }
      });
    });
    return Array.from(solutionsMap.values()).sort((a, b) => a.number - b.number);
  }, [supplierGroups]);

  // Filtrer les fournisseurs en fonction de la solution sélectionnée
  const filteredSupplierGroups = useMemo(() => {
    if (selectedSolutionNumber === 'all') {
      return supplierGroups;
    }
    return supplierGroups.filter(group => 
      group.solutions.some(solution => solution.solution_number === selectedSolutionNumber)
    );
  }, [supplierGroups, selectedSolutionNumber]);

  if (isLoading && supplierGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <FastSearchLoadingAnimation briefTitle={briefTitle} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <h3 className="text-red-700 font-bold text-xl">An error occurred</h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (supplierGroups.length === 0) {
    return null; // Ne rien afficher si aucun fournisseur n'est trouvé pour ce brief
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 pt-8">
      {/* Header avec filtre et bouton d'export */}
      <div className="mb-6 flex justify-between items-start">
        {/* Filtre par solution */}
        {allSolutions.length > 1 ? (
          <div className="relative">
            <label htmlFor="solution-filter" className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Solution
            </label>
            <div className="relative">
              <select
                id="solution-filter"
                name="solution-filter"
                className="appearance-none bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-gray-700 py-3 pl-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 shadow-sm transition duration-200 ease-in-out min-w-[280px]"
                value={selectedSolutionNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedSolutionNumber(value === 'all' ? 'all' : Number(value));
                }}
              >
                <option value="all">🔍 All Solutions ({supplierGroups.length} suppliers)</option>
                {allSolutions.map(solution => (
                  <option key={solution.id} value={solution.number}>
                    ✓ Solution {solution.number}: {solution.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-500">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
        
        {/* Bouton d'export attractif */}
        <div className="flex items-center gap-4">
          {/* Bouton d'export CSV */}
          <button
            onClick={() => handleExport('csv')}
          disabled={isExportingCSV || filteredSupplierGroups.length === 0}
          className="group relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative flex items-center gap-3">
              {isExportingCSV ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Export CSV</span>
                  <div className="bg-white/20 px-2 py-1 rounded-md text-xs">
                    {filteredSupplierGroups.length}
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Bouton d'export Excel */}
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExportingXLSX || filteredSupplierGroups.length === 0}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative flex items-center gap-3">
              {isExportingXLSX ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Export Excel</span>
                  <div className="bg-white/20 px-2 py-1 rounded-md text-xs">
                    {filteredSupplierGroups.length}
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
      
      <SupplierCarousel supplierGroups={filteredSupplierGroups} onSolutionSelect={setSelectedSolutionNumber} />
    </div>
  );
}
