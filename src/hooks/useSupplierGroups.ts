import { useState, useEffect } from 'react';
import type { SupplierGroup } from '../types/supplierTypes';
import { createClient } from '@supabase/supabase-js';

interface UseSupplierGroupsProps {
  briefId: string;
  enabled?: boolean;
}

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useSupplierGroups = ({ 
  briefId, 
  enabled = true
}: UseSupplierGroupsProps) => {
  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplierGroups = async () => {
    if (!enabled || !briefId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les données avec jointure pour avoir l'URL
      const { data: supplierMatches, error: fetchError } = await supabase
        .from('supplier_match_profiles')
        .select(`
          *,
          suppliers!inner(id, name, description, url, country, company_overview, logo_url, available_products, key_features, region, company_type, company_size),
          solutions!left(id, title, solution_number)
        `)
        .eq('brief_id', briefId)
        .order('overall_match_score', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch supplier matches: ${fetchError.message}`);
      }

      if (!supplierMatches || supplierMatches.length === 0) {
        setSupplierGroups([]);
        return;
      }

      // Grouper par fournisseur
      const groupedSuppliers = groupSuppliersBySupplier(supplierMatches);
      setSupplierGroups(groupedSuppliers);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process supplier data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierGroups();
    
    // Abonnement realtime pour les mises à jour automatiques
    if (!enabled || !briefId) return;
    
    const channel = supabase
      .channel(`supplier_match_profiles_${briefId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_match_profiles',
          filter: `brief_id=eq.${briefId}`
        },
        (payload) => {
          console.log('Realtime update on supplier_match_profiles:', payload);
          // Refetch les données quand il y a un changement
          fetchSupplierGroups();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [briefId, enabled]);

  return {
    supplierGroups,
    isLoading,
    error,
    refresh: fetchSupplierGroups,
    hasMore: false // On charge tout, donc pas de pagination pour l'instant
  };
};

// Fonction pour grouper les supplier_match_profiles par fournisseur
function groupSuppliersBySupplier(supplierMatches: any[]): SupplierGroup[] {
  const supplierMap = new Map<string, SupplierGroup>();

  supplierMatches.forEach((match: any) => {
    const supplierId = match.supplier_id;
    const supplier = match.suppliers; // Données du fournisseur depuis la jointure
    
    if (!supplierMap.has(supplierId)) {
      // Créer un nouveau groupe fournisseur
      supplierMap.set(supplierId, {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description || 'No description available',
          overview: supplier.company_overview || supplier.description || 'No overview available',
          country: supplier.country || 'N/A',
          region: supplier.region || getRegionFromCountry(supplier.country),
          company_size: supplier.company_size || 'N/A',
          company_type: supplier.company_type || 'N/A',
          website: supplier.url, // Pour compatibilité
          url: supplier.url,
          created_at: new Date().toISOString(),
          brief_id: match.brief_id
        },
        solutions: [],
        scores: {
          solution_fit: match.solution_fit_score || 0,
          solution_fit_explanation: match.solution_fit_explanation || '',
          brief_fit: match.brief_fit_score || 0,
          brief_fit_explanation: match.brief_fit_explanation || '',
          criteria_match: 80, // Placeholder, to be updated later
          overall: match.overall_match_score || 0, // LEGACY
          // Nouveaux scores individuels des critères
          geography_score: match.geography_score ?? 1, // Défaut jaune si non défini
          company_size_score: match.company_size_score ?? 1,
          maturity_score: match.maturity_score ?? 1,
          organization_score: match.organization_score ?? 1,
          // Nouveau système de scoring dynamique
          score_entreprise: match.score_entreprise,
          score_produit_brief: match.score_produit_brief,
          score_fiabilite: match.score_fiabilite,
          score_criteres: match.score_criteres,
          // Explications détaillées pour chaque score
          score_produit_brief_explanation: match.score_produit_brief_explanation,
          score_fiabilite_explanation: match.score_fiabilite_explanation,
          score_criteres_explanation: match.score_criteres_explanation
        },
        ai_explanation: match.match_explanation || 'This supplier matches your requirements based on our analysis.',
        total_products: 0
      });
    }

    const supplierGroup = supplierMap.get(supplierId)!;
    
    // Ajouter la solution si elle n'existe pas déjà
    const existingSolution = supplierGroup.solutions.find(s => s.id === match.solution_id);
    if (!existingSolution && match.solutions) {
      const products = supplier.available_products ? 
        (Array.isArray(supplier.available_products) ? supplier.available_products : [supplier.available_products]) : [];
      
      supplierGroup.solutions.push({
        id: match.solution_id,
        title: match.solutions.title,
        solution_number: match.solutions.solution_number,
        products: products.map((product: any, index: number) => ({
          id: `${match.supplier_id}-product-${index}`,
          name: typeof product === 'string' ? product : product.name || 'Unknown Product',
          description: typeof product === 'object' ? product.product_description || '' : '',
          created_at: new Date().toISOString(),
          metadata: product
        }))
      });
      
      supplierGroup.total_products += products.length;
    }
  });

  // Convertir en array et trier par score global
  const groups = Array.from(supplierMap.values());
  return groups.sort((a, b) => b.scores.overall - a.scores.overall);
}

// Fonction utilitaire pour déterminer la région à partir du pays
function getRegionFromCountry(country?: string): string {
  if (!country) return 'N/A';
  
  const countryLower = country.toLowerCase();
  
  if (countryLower.includes('usa') || countryLower.includes('united states') || countryLower.includes('canada')) {
    return 'North America';
  }
  if (countryLower.includes('france') || countryLower.includes('germany') || countryLower.includes('uk') || 
      countryLower.includes('spain') || countryLower.includes('italy') || countryLower.includes('europe')) {
    return 'Europe';
  }
  if (countryLower.includes('china') || countryLower.includes('japan') || countryLower.includes('korea') || 
      countryLower.includes('singapore') || countryLower.includes('asia')) {
    return 'Asia';
  }
  
  return 'Other';
}
