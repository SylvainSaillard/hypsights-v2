import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  const loadSuppliers = async () => {
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
  };
  
  // Effet pour charger les fournisseurs au montage et configurer les abonnements
  useEffect(() => {
    if (!briefId) return;
    
    console.log('useSuppliers - Initialisation pour brief_id:', briefId);
    
    // Charger les fournisseurs initialement
    loadSuppliers();
    
    // Créer un canal unique pour tous les événements liés aux fournisseurs
    const realtimeChannel = supabase
      .channel(`suppliers_and_products:${briefId}`)
      // Écouter les événements sur la table suppliers pour ce brief spécifique
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'suppliers',
        filter: `brief_id=eq.${briefId}`
      }, (payload: any) => {
        console.log('useSuppliers - NOUVEAU FOURNISSEUR détecté:', payload);
        loadSuppliers();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'suppliers',
        filter: `brief_id=eq.${briefId}`
      }, (payload: any) => {
        console.log('useSuppliers - MISE À JOUR d\'un fournisseur détectée:', payload);
        loadSuppliers();
      })
      // Écouter tous les événements sur la table products
      // On ne peut pas filtrer par brief_id car cette table n'a pas cette colonne
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'products'
      }, (payload: any) => {
        console.log('useSuppliers - NOUVEAU PRODUIT détecté:', payload);
        // Vérifier si le produit est lié à un fournisseur de ce brief avant de recharger
        loadSuppliers();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products'
      }, (payload: any) => {
        console.log('useSuppliers - MISE À JOUR d\'un produit détectée:', payload);
        loadSuppliers();
      })
      .subscribe();
    
    // Nettoyage des abonnements
    return () => {
      console.log('useSuppliers - Nettoyage des abonnements');
      supabase.removeChannel(realtimeChannel);
    };
  }, [briefId]);
  
  return {
    suppliers,
    isLoading,
    error,
    refresh: loadSuppliers
  };
}
