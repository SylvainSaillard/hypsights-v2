// Imports supprimés pour le test simple

import { useSupplierGroups } from '../../hooks/useSupplierGroups';
import SupplierCarousel from '../suppliers/SupplierCarousel';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface NewSuppliersPanelProps {
  briefId: string;
}

export function NewSuppliersPanel({ briefId }: NewSuppliersPanelProps) {
  const { supplierGroups, isLoading, error } = useSupplierGroups({ briefId });

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
    return null; // Ne rien afficher si aucun fournisseur n'est trouvé
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-4">Suppliers Found ({supplierGroups.length})</h2>
      <SupplierCarousel supplierGroups={supplierGroups} />
    </div>
  );
}
