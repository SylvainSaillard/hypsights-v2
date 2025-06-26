import { useSuppliers } from '../../hooks/useSuppliers';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import SupplierMatchCard from '../suppliers/SupplierMatchCard';

interface SuppliersPanelProps {
  briefId: string;
}

export function SuppliersPanel({ briefId }: SuppliersPanelProps) {
  const { suppliers, isLoading, error, refresh } = useSuppliers(briefId);

  if (isLoading && suppliers.length === 0) {
    return (
      <div className="p-6 bg-gray-900 rounded-2xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-4 text-gray-400 text-lg">Finding best suppliers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 rounded-2xl">
        <div className="bg-red-900 bg-opacity-50 p-6 rounded-lg text-center">
          <h3 className="text-red-300 font-bold text-xl">An error occurred</h3>
          <p className="text-red-400 mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => refresh()}
          >
            Try again
          </button>
        </div>
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
            onClick={() => refresh()}
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
        <h2 className="text-2xl font-bold text-white">Recommended Suppliers ({suppliers.length})</h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-6">
        {suppliers.map((match) => (
          <SupplierMatchCard key={match.supplier_id} match={match} />
        ))}
      </div>
    </div>
  );
}
