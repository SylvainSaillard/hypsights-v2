// Types pour la nouvelle interface fournisseurs groupés
export interface EnrichedSupplier {
  id: string;
  name: string;
  description: string;
  overview?: string;
  country?: string;
  region?: string;
  company_size?: string;
  company_type?: string;
  website?: string;
  url?: string;
  created_at: string;
  brief_id: string;
}

export interface SupplierScores {
  solution_fit?: number;
  brief_fit?: number;
  criteria_match?: number;
  overall: number;
}

export interface SupplierSolution {
  id: string;
  title: string;
  solution_number?: number;
  products: SupplierProduct[];
}

export interface SupplierProduct {
  id: string;
  name: string;
  description: string;
  created_at: string;
  metadata?: any;
}

export interface SupplierGroup {
  supplier: EnrichedSupplier;
  solutions: SupplierSolution[];
  scores: {
    solution_fit: number;
    solution_fit_explanation: string;
    brief_fit: number;
    brief_fit_explanation: string;
    criteria_match: number;
    overall: number;
  };
  ai_explanation?: string;
  total_products: number;
}

export interface SupplierGroupsResponse {
  supplier_groups: SupplierGroup[];
  total_suppliers: number;
  has_more: boolean;
}
