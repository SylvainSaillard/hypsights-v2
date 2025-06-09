// Le React est importé automatiquement avec JSX
import { useSuppliers } from '../../hooks/useSuppliers';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SuppliersPanelProps {
  briefId: string;
}

/**
 * Composant simplifié pour afficher les fournisseurs d'un brief
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
export function SuppliersPanel({ briefId }: SuppliersPanelProps) {
  const { suppliers, isLoading, error, refresh } = useSuppliers(briefId);
  
  // Afficher l'état de chargement
  if (isLoading && suppliers.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Chargement des fournisseurs...</span>
        </div>
      </div>
    );
  }
  
  // Afficher les erreurs
  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Une erreur est survenue</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={() => refresh()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  // Afficher un message si aucun fournisseur n'est trouvé
  if (suppliers.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun fournisseur trouvé pour ce brief.</p>
          <button 
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            onClick={() => refresh()}
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }
  
  // Afficher la liste des fournisseurs
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Fournisseurs ({suppliers.length})</h2>
        <button 
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          onClick={() => refresh()}
        >
          Rafraîchir
        </button>
      </div>
      
      {/* Liste des fournisseurs */}
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="border rounded-md p-3 hover:bg-gray-50">
            <h3 className="font-medium">{supplier.name}</h3>
            {supplier.description && (
              <p className="text-gray-600 text-sm mt-1">{supplier.description}</p>
            )}
            
            {/* Produits du fournisseur */}
            {supplier.products && supplier.products.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700">Produits ({supplier.products.length})</h4>
                <ul className="mt-1 space-y-1">
                  {supplier.products.map((product: any) => (
                    <li key={product.id} className="text-sm pl-2 border-l-2 border-gray-200">
                      <span className="font-medium">{product.name}</span>
                      {product.description && (
                        <p className="text-xs text-gray-500">{product.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
