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
        
        // Les fournisseurs sont déjà filtrés par brief_id côté serveur
        // mais vérifions quand même pour plus de sécurité
        const suppliers = data.suppliers || [];
        
        console.log('useFastSearchResults - Fournisseurs reçus:', {
          count: suppliers.length,
          briefId: briefId
        });
        
        // Afficher des détails sur les fournisseurs pour débogage
        if (suppliers.length > 0) {
          suppliers.forEach((supplier: any) => {
            console.log(`useFastSearchResults - Fournisseur ${supplier.id} (${supplier.name}) - brief_id=${supplier.brief_id}`);
          });
        }
        
        setSuppliers(suppliers);
        
        // Gérer le statut de recherche
        if (data.search) {
          const searchStatus = data.search.status || 'processing';
          console.log('useFastSearchResults - Statut mis à jour:', searchStatus);
          setStatus(searchStatus);
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
        console.log('useFastSearchResults - Changement détecté dans la table suppliers');
        // Récupérer les résultats
        getFastSearchResults(briefId)
          .then(data => {
            console.log('useFastSearchResults - Données rafraîchies après changement suppliers:', {
              suppliersCount: data.suppliers?.length || 0,
              searchStatus: data.search?.status
            });
            setSuppliers(data.suppliers || []);
            if (data.search?.status) {
              setStatus(data.search.status);
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
        console.log('useFastSearchResults - Changement détecté dans la table products');
        // Rafraîchir les résultats
        getFastSearchResults(briefId)
          .then(data => {
            console.log('useFastSearchResults - Données rafraîchies après changement products:', {
              suppliersCount: data.suppliers?.length || 0,
              searchStatus: data.search?.status
            });
            setSuppliers(data.suppliers || []);
            if (data.search?.status) {
              setStatus(data.search.status);
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
        console.log('useFastSearchResults - Changement détecté dans la table searches:', payload.new);
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
