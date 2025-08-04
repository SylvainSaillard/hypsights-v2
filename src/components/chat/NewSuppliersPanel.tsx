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
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('all');

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
    if (selectedSolutionId === 'all') {
      return supplierGroups;
    }
    return supplierGroups.filter(group => 
      group.solutions.some(solution => solution.id === selectedSolutionId)
    );
  }, [supplierGroups, selectedSolutionId]);

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
        <div className="mb-6 max-w-sm">
          <label htmlFor="solution-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Solution
          </label>
          <select
            id="solution-filter"
            name="solution-filter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            value={selectedSolutionId}
            onChange={(e) => setSelectedSolutionId(e.target.value)}
          >
            <option value="all">All Solutions ({supplierGroups.length} suppliers)</option>
            {allSolutions.map(solution => (
              <option key={solution.id} value={solution.id}>
                Solution {solution.number}: {solution.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <SupplierCarousel supplierGroups={filteredSupplierGroups} />
    </div>
  );
}
