import { useSuppliers } from '../../hooks/useSuppliers';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SolutionSection } from '../suppliers/SolutionSection';

interface SuppliersPanelProps {
  briefId: string;
}

export function SuppliersPanel({ briefId }: SuppliersPanelProps) {
  const { suppliers, solutionGroups, isLoading, error, refresh } = useSuppliers(briefId);

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error loading suppliers: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="p-6 bg-gray-900 rounded-2xl">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No suppliers found for this brief yet.</p>
          <p className="text-gray-500 text-sm mt-2">Please check back later or start a new search.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommended Suppliers ({suppliers.length})</h2>
          <p className="text-gray-400 text-sm mt-1">
            Only showing suppliers with {'>'}70% match score
          </p>
        </div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-6">
        {solutionGroups.map((solutionGroup, index) => (
          <SolutionSection 
            key={solutionGroup.solutionId}
            solutionName={solutionGroup.solutionName}
            solutionNumber={solutionGroup.solutionNumber}
            suppliers={solutionGroup.suppliers}
            defaultExpanded={index === 0} // Première solution dépliée par défaut
          />
        ))}
      </div>
    </div>
  );
}
