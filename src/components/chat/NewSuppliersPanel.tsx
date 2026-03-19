import { useState, useMemo } from 'react';
import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import SupplierCarousel from '../suppliers/SupplierCarousel';
import SupplierFiltersBar, { DEFAULT_FILTERS, applySupplierFilters } from '../suppliers/SupplierFilters';
import type { SupplierFilters } from '../suppliers/SupplierFilters';
import { FastSearchLoadingAnimation } from '../animations/FastSearchLoadingAnimation';
import { supabase } from '../../lib/supabaseClient';

interface NewSuppliersPanelProps {
  briefId: string;
  briefTitle: string;
  isFastSearchInProgress?: boolean;
}

export function NewSuppliersPanel({ briefId, briefTitle, isFastSearchInProgress = false }: NewSuppliersPanelProps) {
  const { supplierGroups, isLoading, error } = useSupplierGroups({ briefId });
  const [filters, setFilters] = useState<SupplierFilters>({ ...DEFAULT_FILTERS });
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

  // Derive unique solutions list for the filter
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

  // Apply all filters
  const filteredSupplierGroups = useMemo(() => {
    return applySupplierFilters(supplierGroups, filters);
  }, [supplierGroups, filters]);

  // Show loading animation if initial loading OR if Fast Search is in progress with no suppliers yet
  if (isLoading || (isFastSearchInProgress && supplierGroups.length === 0)) {
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
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No suppliers found yet</h3>
        <p className="text-gray-600">Launch a Fast Search to discover new suppliers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 pt-8">
      {/* Export buttons */}
      <div className="mb-4 flex justify-end items-center gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={isExportingCSV || filteredSupplierGroups.length === 0}
          className="group relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="relative flex items-center gap-2">
            {isExportingCSV ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="text-sm">Export CSV</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{filteredSupplierGroups.length}</span>
              </>
            )}
          </div>
        </button>
        <button
          onClick={() => handleExport('xlsx')}
          disabled={isExportingXLSX || filteredSupplierGroups.length === 0}
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="relative flex items-center gap-2">
            {isExportingXLSX ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="text-sm">Export Excel</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{filteredSupplierGroups.length}</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Filters */}
      <SupplierFiltersBar
        supplierGroups={supplierGroups}
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredSupplierGroups.length}
        totalCount={supplierGroups.length}
        solutions={allSolutions}
      />

      <SupplierCarousel supplierGroups={filteredSupplierGroups} />
    </div>
  );
}
