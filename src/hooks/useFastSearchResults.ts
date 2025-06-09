import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getFastSearchResults } from '../services/fastSearchService';

export function useFastSearchResults(briefId: string, isActive: boolean) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les résultats quand isActive est true
  useEffect(() => {
    if (!briefId || !isActive) return;
    
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getFastSearchResults(briefId);
        // Filtrer les fournisseurs par brief_id côté client
        const filteredSuppliers = (data.suppliers || []).filter((supplier: any) => supplier.brief_id === briefId);
        setSuppliers(filteredSuppliers);
        if (data.status) {
          setStatus(data.status);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
    
    // Configurer un intervalle pour rafraîchir les résultats
    const intervalId = setInterval(fetchResults, 5000);
    
    return () => clearInterval(intervalId);
  }, [briefId, isActive]);
  
  // S'abonner aux mises à jour en temps réel des fournisseurs
  useEffect(() => {
    if (!briefId || !isActive) return;
    
    // S'abonner aux changements dans la table suppliers
    const suppliersChannel = supabase
      .channel(`suppliers:${briefId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suppliers'
        // Suppression du filtre restrictif pour capter tous les nouveaux fournisseurs
        // Le filtrage sera fait côté client après récupération
      }, () => {
        // Récupérer les résultats
        getFastSearchResults(briefId)
          .then(data => {
            // Filtrer les fournisseurs par brief_id côté client pour s'assurer qu'on n'affiche que ceux liés au brief actuel
            const filteredSuppliers = (data.suppliers || []).filter((supplier: any) => supplier.brief_id === briefId);
            setSuppliers(filteredSuppliers);
            if (data.status) {
              setStatus(data.status);
            }
          })
          .catch(err => console.error('Error refreshing suppliers:', err));
      })
      .subscribe();
    
    // S'abonner aux changements dans la table products
    const productsChannel = supabase
      .channel(`products:brief:${briefId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        // Rafraîchir les résultats
        getFastSearchResults(briefId)
          .then(data => {
            setSuppliers(data.suppliers || []);
            if (data.status) {
              setStatus(data.status);
            }
          })
          .catch(err => console.error('Error refreshing products:', err));
      })
      .subscribe();
    
    // S'abonner aux changements de statut de recherche
    const searchesChannel = supabase
      .channel(`searches:brief:${briefId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'searches',
        filter: `brief_id=eq.${briefId}`
      }, (payload: { new: { status: string } }) => {
        setStatus(payload.new.status);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(searchesChannel);
    };
  }, [briefId, isActive]);
  
  return { suppliers, status, loading, error };
}
