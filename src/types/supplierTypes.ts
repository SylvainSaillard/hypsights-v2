// Types pour la nouvelle interface fournisseurs groupés
export interface EnrichedSupplier {
  id: string;
  name: string;
  description?: string;
  overview?: string;
  website?: string;
  url?: string;
  country?: string;
  region?: string;
  industry?: string;
  company_size?: string;
  company_type?: string;
  maturity?: string;
  founded_year?: number;
  contact_info?: any;
  logo_url?: string;
  key_features?: any;
  available_products?: any;
  created_at: string;
  metadata?: any;
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
  description?: string;
  status?: string;
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
    overall: number; // LEGACY - kept for backward compatibility
    // Nouveaux scores individuels des critères (0=Rouge, 1=Jaune, 2=Vert)
    geography_score: number;
    company_size_score: number;
    maturity_score: number;
    organization_score: number;
    // Nouveau système de scoring dynamique
    score_entreprise?: number; // Nouveau score global (0-100)
    score_produit_brief?: number; // Score pertinence produit/brief (0-100)
    score_fiabilite?: number; // Score fiabilité entreprise (0-100)
    score_criteres?: number; // Score critères stricts (0-100)
    // Explications détaillées pour chaque score
    score_produit_brief_explanation?: string;
    score_fiabilite_explanation?: string;
    score_criteres_explanation?: string;
    // Transparence du calcul du score global
    scoring_reasoning?: string;
  };
  ai_explanation?: string;
  total_products: number;
}

export interface SupplierGroupsResponse {
  supplier_groups: SupplierGroup[];
  total_suppliers: number;
  has_more: boolean;
}
