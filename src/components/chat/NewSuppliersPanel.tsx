// Imports supprimés pour le test simple

interface SuppliersPanelProps {
  briefId: string;
}

export function NewSuppliersPanel({ briefId }: SuppliersPanelProps) {
  return (
    <div className="p-4 my-4 bg-yellow-100 border-2 border-dashed border-yellow-500 rounded-lg">
      <h3 className="font-bold text-yellow-800">Nouveau Panneau Fournisseurs (en construction)</h3>
      <p className="text-sm text-yellow-700">Brief ID: {briefId}</p>
    </div>
  );
}
