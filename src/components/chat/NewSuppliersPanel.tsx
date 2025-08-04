// Imports supprimés pour le test simple

interface SuppliersPanelProps {
  briefId: string;
}

export function NewSuppliersPanel({ briefId }: SuppliersPanelProps) {
  console.log('NewSuppliersPanel rendering with briefId:', briefId);
  
  return (
    <div className="border-4 border-yellow-400 bg-yellow-50 p-8 rounded-lg my-4">
      <h2 className="text-3xl font-bold text-red-600 mb-4">
        TEST PANEL - SHOULD BE VISIBLE
      </h2>
      <p className="text-lg text-gray-800">
        Brief ID: {briefId}
      </p>
      <p className="text-lg text-gray-800">
        Si vous voyez ce texte, le composant fonctionne !
      </p>
    </div>
  );
}
