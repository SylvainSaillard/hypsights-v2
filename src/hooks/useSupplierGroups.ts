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
      // Récupérer les données de supplier_matches
      const { data: supplierMatches, error: fetchError } = await supabase
        .from('supplier_matches')
        .select('*')
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
  }, [briefId, enabled]);

  return {
    supplierGroups,
    isLoading,
    error,
    refresh: fetchSupplierGroups,
    hasMore: false // On charge tout, donc pas de pagination pour l'instant
  };
};

// Fonction pour grouper les supplier_matches par fournisseur
function groupSuppliersBySupplier(supplierMatches: any[]): SupplierGroup[] {
  const supplierMap = new Map<string, SupplierGroup>();

  supplierMatches.forEach((match: any) => {
    const supplierId = match.supplier_id;
    
    if (!supplierMap.has(supplierId)) {
      // Créer un nouveau groupe fournisseur
      supplierMap.set(supplierId, {
        supplier: {
          id: match.supplier_id,
          name: match.supplier_name,
          description: match.description || 'No description available',
          overview: match.company_overview || match.description || 'No overview available',
          country: match.country || 'N/A',
          region: getRegionFromCountry(match.country),
          company_size: 'N/A', // À enrichir plus tard
          company_type: 'N/A', // À enrichir plus tard
          website: match.website,
          created_at: new Date().toISOString(),
          brief_id: match.brief_id
        },
        solutions: [],
        scores: {
          solution_fit: match.technical_fit_score || 75,
          brief_fit: match.market_relevance_score || 75,
          criteria_match: match.delivery_capacity_score || 75,
          overall: match.overall_match_score || 75
        },
        ai_explanation: match.match_explanation || 'This supplier matches your requirements based on our analysis.',
        total_products: 0
      });
    }

    const supplierGroup = supplierMap.get(supplierId)!;
    
    // Ajouter la solution si elle n'existe pas déjà
    const existingSolution = supplierGroup.solutions.find(s => s.id === match.solution_id);
    if (!existingSolution) {
      const products = match.available_products ? 
        (Array.isArray(match.available_products) ? match.available_products : [match.available_products]) : [];
      
      supplierGroup.solutions.push({
        id: match.solution_id,
        title: match.solution_name,
        solution_number: match.solution_number,
        products: products.map((product: any, index: number) => ({
          id: `${match.supplier_id}-product-${index}`,
          name: typeof product === 'string' ? product : product.name || 'Unknown Product',
          description: typeof product === 'object' ? product.description || '' : '',
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
