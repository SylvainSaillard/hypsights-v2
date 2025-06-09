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
    if (!briefId || !isActive) {
      console.log('useFastSearchResults - Hook inactif ou briefId manquant:', { briefId, isActive });
      return;
    }
    
    console.log('useFastSearchResults - Démarrage du chargement des résultats pour brief:', briefId);
    
    const fetchResults = async () => {
      try {
        setLoading(true);
        console.log('useFastSearchResults - Appel getFastSearchResults pour brief:', briefId);
        const data = await getFastSearchResults(briefId);
        console.log('useFastSearchResults - Résultats reçus:', {
          status: data.search?.status,
          suppliersCount: data.suppliers?.length || 0,
          search: data.search,
          briefId: briefId
        });
        
        // Déboguer les données brutes reçues
        if (data.suppliers && data.suppliers.length > 0) {
          console.log('useFastSearchResults - Premier fournisseur reçu:', {
            id: data.suppliers[0].id,
            name: data.suppliers[0].name,
            brief_id: data.suppliers[0].brief_id,
            productsCount: data.suppliers[0].products?.length || 0
          });
        }
        
        // Filtrer les fournisseurs par brief_id côté client
        const filteredSuppliers = (data.suppliers || []).filter((supplier: any) => {
          const matches = supplier.brief_id === briefId;
          console.log(`useFastSearchResults - Fournisseur ${supplier.id} (${supplier.name}) - brief_id=${supplier.brief_id}, match=${matches}`);
          return matches;
        });
        
        console.log('useFastSearchResults - Fournisseurs filtrés:', {
          avant: data.suppliers?.length || 0,
          après: filteredSuppliers.length,
          briefId: briefId
        });
        
        setSuppliers(filteredSuppliers);
        if (data.search?.status) {
          console.log('useFastSearchResults - Statut mis à jour:', data.search.status);
          setStatus(data.search.status);
        }
      } catch (err) {
        console.error('useFastSearchResults - Erreur:', err);
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
