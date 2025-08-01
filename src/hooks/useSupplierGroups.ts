import { useState, useEffect } from 'react';
import type { SupplierGroup } from '../types/supplierTypes';
import useEdgeFunction from './useEdgeFunction';

interface UseSupplierGroupsProps {
  briefId: string;
  enabled?: boolean;
  maxResults?: number;
}

export const useSupplierGroups = ({ 
  briefId, 
  enabled = true, 
  maxResults = 10 
}: UseSupplierGroupsProps) => {
  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pour l'instant, on utilise les données existantes et on les transforme
  // Plus tard, on pourra créer un endpoint dédié
  const { data: briefData, loading: briefLoading, error: briefError, refresh } = useEdgeFunction(
    'brief-operations',
    { action: 'get_brief', brief_id: briefId },
    { enabled }
  );

  useEffect(() => {
    if (!enabled || briefLoading || briefError || !briefData?.brief) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Transformer les données existantes en format groupé par fournisseur
      const transformedGroups = transformToSupplierGroups(briefData.brief);
      setSupplierGroups(transformedGroups.slice(0, maxResults));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process supplier data');
    } finally {
      setIsLoading(false);
    }
  }, [briefData, briefLoading, briefError, enabled, maxResults]);

  return {
    supplierGroups,
    isLoading: isLoading || briefLoading,
    error: error || briefError,
    refresh,
    hasMore: supplierGroups.length >= maxResults
  };
};

// Fonction utilitaire pour transformer les données existantes
function transformToSupplierGroups(brief: any): SupplierGroup[] {
  if (!brief.solutions) return [];

  // Créer un map des fournisseurs
  const supplierMap = new Map<string, SupplierGroup>();

  brief.solutions.forEach((solution: any) => {
    if (!solution.suppliers) return;

    solution.suppliers.forEach((supplier: any) => {
      const supplierId = supplier.id;
      
      if (!supplierMap.has(supplierId)) {
        // Créer un nouveau groupe fournisseur
        supplierMap.set(supplierId, {
          supplier: {
            id: supplier.id,
            name: supplier.name,
            description: supplier.description,
            overview: supplier.overview || supplier.description,
            country: supplier.country || 'N/A',
            region: supplier.region || 'N/A',
            company_size: supplier.company_size || 'N/A',
            company_type: supplier.company_type || 'N/A',
            website: supplier.website,
            created_at: supplier.created_at,
            brief_id: brief.id
          },
          solutions: [],
          scores: {
            solution_fit: supplier.solution_fit_score || Math.floor(Math.random() * 40) + 60, // Mock data
            brief_fit: supplier.brief_fit_score || Math.floor(Math.random() * 40) + 60, // Mock data
            criteria_match: supplier.criteria_match_score || Math.floor(Math.random() * 40) + 60, // Mock data
            overall: supplier.match_score || Math.floor(Math.random() * 40) + 60
          },
          ai_explanation: supplier.ai_explanation || generateMockExplanation(supplier.name),
          total_products: 0
        });
      }

      const supplierGroup = supplierMap.get(supplierId)!;
      
      // Ajouter la solution si elle n'existe pas déjà
      const existingSolution = supplierGroup.solutions.find(s => s.id === solution.id);
      if (!existingSolution) {
        supplierGroup.solutions.push({
          id: solution.id,
          title: solution.title,
          solution_number: solution.solution_number,
          products: supplier.products || []
        });
      }

      // Mettre à jour le total des produits
      supplierGroup.total_products += (supplier.products || []).length;
    });
  });

  // Convertir en array et trier par score global
  const groups = Array.from(supplierMap.values());
  return groups.sort((a, b) => b.scores.overall - a.scores.overall);
}

// Fonction pour générer une explication IA mock (temporaire)
function generateMockExplanation(supplierName: string): string {
  const explanations = [
    `${supplierName} shows strong alignment with your requirements, particularly in terms of technical capabilities and market positioning.`,
    `This supplier demonstrates excellent potential for your project with proven expertise in the relevant domain and competitive pricing.`,
    `${supplierName} stands out for their innovative approach and strong track record in delivering similar solutions to enterprises.`,
    `The match is based on geographical proximity, technical expertise, and alignment with your specified criteria and budget range.`
  ];
  
  return explanations[Math.floor(Math.random() * explanations.length)];
}
