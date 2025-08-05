// Imports supprimés pour le test simple

import { useState, useMemo } from 'react';
import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import SupplierCarousel from '../suppliers/SupplierCarousel';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface NewSuppliersPanelProps {
  briefId: string;
}

export function NewSuppliersPanel({ briefId }: NewSuppliersPanelProps) {
  const { supplierGroups, isLoading, error } = useSupplierGroups({ briefId });
  const [selectedSolutionNumber, setSelectedSolutionNumber] = useState<number | 'all'>('all');

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

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-4 text-gray-500 text-lg">Finding best suppliers...</span>
        </div>
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      {allSolutions.length > 1 && (
        <div className="mb-6 flex justify-end">
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
        </div>
      )}
      <SupplierCarousel supplierGroups={filteredSupplierGroups} onSolutionSelect={setSelectedSolutionNumber} />
    </div>
  );
}
