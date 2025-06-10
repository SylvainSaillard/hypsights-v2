import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SUPPLIERS_CHANNEL_NAME, PRODUCTS_CHANNEL_NAME } from '../components/chat/types';

/**
 * Hook simplifié pour récupérer les fournisseurs associés à un brief
 * Conforme au principe KISS et Thin Client / Fat Edge
 * Utilise directement Supabase pour les requêtes et le realtime
 */
export function useSuppliers(briefId: string) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour charger les fournisseurs directement depuis Supabase
  const loadSuppliers = useCallback(async () => {
    if (!briefId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('useSuppliers - Chargement des fournisseurs pour brief_id:', briefId);
      
      // Appel direct à Supabase pour récupérer les fournisseurs avec leurs produits
      const { data: suppliersList, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*, products:products!products_supplier_id_fkey(*)')
        .eq('brief_id', briefId);
      
      if (suppliersError) {
        throw suppliersError;
      }
      
      console.log(`useSuppliers - ${suppliersList?.length || 0} fournisseurs récupérés`);
      
      setSuppliers(suppliersList || []);
    } catch (err) {
      console.error('useSuppliers - Erreur:', err);
      setError(`Une erreur est survenue: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [briefId]);
  
  // Effet pour configurer l'abonnement real-time aux fournisseurs
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useSuppliers - Configuration de l\'abonnement Realtime pour briefId:', briefId);
    
    // Abonnement aux fournisseurs - exactement comme useSolutions
    const suppliersChannel = supabase
      .channel(`${SUPPLIERS_CHANNEL_NAME}_${briefId}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'suppliers',
        filter: `brief_id=eq.${briefId}`
      }, (payload: any) => {
        console.log('useSuppliers - Changement détecté dans la table suppliers:', payload);
        
        // Rafraîchir tous les fournisseurs pour avoir l'état le plus récent
        loadSuppliers();
      })
      .subscribe((status: any) => {
        console.log('useSuppliers - Suppliers subscription status:', status);
      });
    
    // Abonnement aux produits - à part pour une meilleure visibilité
    const productsChannel = supabase
      .channel(`${PRODUCTS_CHANNEL_NAME}_${briefId}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'products'
      }, (payload: any) => {
        console.log('useSuppliers - Changement détecté dans la table products:', payload);
        
        // Rafraîchir tous les fournisseurs pour avoir l'état le plus récent
        loadSuppliers();
      })
      .subscribe((status: any) => {
        console.log('useSuppliers - Products subscription status:', status);
      });
    
    // Charger les fournisseurs au montage
    loadSuppliers();
    
    // Nettoyage des abonnements
    return () => {
      console.log('useSuppliers - Nettoyage des abonnements');
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [briefId, loadSuppliers]);
  
  return {
    suppliers,
    isLoading,
    error,
    refresh: loadSuppliers
  };
}
