import { useState, useEffect } from 'react';
import type { SupplierGroup } from '../types/supplierTypes';
import { supabase } from '../lib/supabaseClient';

interface UseSupplierGroupsProps {
  briefId: string;
  enabled?: boolean;
}

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

      // Fetch max product score per supplier for this brief
      const supplierIds = [...new Set(supplierMatches.map((m: any) => m.supplier_id))];
      let productScoreMap: Record<string, number> = {};
      if (supplierIds.length > 0) {
        const { data: productScores } = await supabase
          .rpc('get_max_product_scores', { p_brief_id: briefId });
        if (productScores) {
          productScores.forEach((row: any) => {
            productScoreMap[row.supplier_id] = row.max_score;
          });
        }
      }

      // Grouper par fournisseur
      const groupedSuppliers = groupSuppliersBySupplier(supplierMatches, productScoreMap);
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
function normalizeCountry(country?: string): string {
  if (!country) return 'N/A';
  const c = country.trim();
  const lower = c.toLowerCase();
  if (lower === 'united states' || lower === 'united states of america' || lower === 'us') return 'USA';
  if (lower === 'united kingdom' || lower === 'great britain' || lower === 'gb') return 'United Kingdom';
  if (lower === '' || lower === 'unknown' || lower === 'n/a') return 'N/A';
  // Capitalize first letter
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function normalizeCompanySize(size?: string): string {
  if (!size) return 'N/A';
  const lower = size.trim().toLowerCase();
  if (lower === 'small' || lower === 'startup') return 'small';
  if (lower === 'medium' || lower === 'sme' || lower === 'mid-size') return 'medium';
  if (lower === 'large' || lower === 'enterprise' || lower === 'large_company') return 'large';
  if (lower === '' || lower === 'unknown' || lower === 'n/a') return 'N/A';
  return lower;
}

function groupSuppliersBySupplier(supplierMatches: any[], productScoreMap: Record<string, number> = {}): SupplierGroup[] {
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
          country: normalizeCountry(supplier.country),
          region: supplier.region || getRegionFromCountry(supplier.country),
          company_size: normalizeCompanySize(supplier.company_size),
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
          score_criteres_explanation: match.score_criteres_explanation,
          // Transparence du calcul du score global
          scoring_reasoning: match.scoring_reasoning
        },
        match_insights: match.match_insights && Object.keys(match.match_insights).length > 0 ? match.match_insights : undefined,
        ai_explanation: match.match_explanation || 'This supplier matches your requirements based on our analysis.',
        total_products: 0,
        max_product_score: productScoreMap[supplierId] ?? undefined
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
