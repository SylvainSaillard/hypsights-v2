// Imports supprimés pour le test simple

interface SuppliersPanelProps {
  briefId: string;
}

export function NewSuppliersPanel({ briefId }: SuppliersPanelProps) {
  console.log('NewSuppliersPanel rendering with briefId:', briefId);
  
  return (
    <div style={{
      position: 'fixed',
      top: '50px',
      left: '50px',
      zIndex: 9999,
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      border: '5px solid yellow',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      COMPOSANT DE TEST - VISIBLE ?
      <br />
      Brief ID: {briefId}
      <br />
      Si vous voyez ceci, ça marche !
    </div>
  );
}
