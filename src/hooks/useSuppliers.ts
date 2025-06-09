import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { executeEdgeAction } from '../lib/edgeActionHelper';

/**
 * Hook simplifié pour récupérer les fournisseurs associés à un brief
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
export function useSuppliers(briefId: string) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour charger les fournisseurs
  const loadSuppliers = async () => {
    if (!briefId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('useSuppliers - Chargement des fournisseurs pour brief_id:', briefId);
      
      // Appel direct à la fonction Edge
      const result = await executeEdgeAction('fast-search-handler', 'get_results', {
        brief_id: briefId
      });
      
      console.log('useSuppliers - Résultat brut:', result);
      
      // Extraire les fournisseurs de la réponse
      const suppliersList = result?.suppliers || [];
      console.log(`useSuppliers - ${suppliersList.length} fournisseurs récupérés`);
      
      setSuppliers(suppliersList);
    } catch (err) {
      console.error('useSuppliers - Erreur:', err);
      setError(`Une erreur est survenue: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effet pour charger les fournisseurs au montage et configurer les abonnements
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useSuppliers - Initialisation pour brief_id:', briefId);
    
    // Charger les fournisseurs initialement
    loadSuppliers();
    
    // S'abonner aux changements dans la table suppliers
    const suppliersChannel = supabase
      .channel(`suppliers:${briefId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suppliers',
        filter: `brief_id=eq.${briefId}`
      }, (payload: any) => {
        console.log('useSuppliers - Changement détecté dans la table suppliers:', payload);
        loadSuppliers();
      })
      .subscribe();
    
    // S'abonner aux changements dans la table products
    const productsChannel = supabase
      .channel(`products:${briefId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        console.log('useSuppliers - Changement détecté dans la table products');
        loadSuppliers();
      })
      .subscribe();
    
    // Nettoyage des abonnements
    return () => {
      console.log('useSuppliers - Nettoyage des abonnements');
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [briefId]);
  
  return {
    suppliers,
    isLoading,
    error,
    refresh: loadSuppliers
  };
}
