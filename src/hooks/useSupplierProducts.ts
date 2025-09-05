import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  supplier_id: string;
  product_description: string;
  category?: string;
  price_range?: string | object;
  tags?: string[];
  features?: string[] | object | string;
  metadata?: object;
  url?: string;
  maturity?: string;
  ai_solution_fit_score?: number;
  ai_solution_fit_explanation?: string;
  ai_brief_fit_score?: number;
  ai_brief_fit_explanation?: string;
  created_at?: string;
  visual_assets?: any;
}

interface UseSupplierProductsProps {
  supplierId: string;
  briefId?: string;
  enabled?: boolean;
}

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useSupplierProducts = ({ 
  supplierId, 
  briefId,
  enabled = true
}: UseSupplierProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!enabled || !supplierId) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId);

      // Si un briefId est fourni, filtrer aussi par brief_id
      if (briefId) {
        query = query.eq('brief_id', briefId);
      }

      const { data: productsData, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch products: ${fetchError.message}`);
      }

      setProducts(productsData || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [supplierId, briefId, enabled]);

  return {
    products,
    isLoading,
    error,
    refresh: fetchProducts,
    totalProducts: products.length
  };
};
