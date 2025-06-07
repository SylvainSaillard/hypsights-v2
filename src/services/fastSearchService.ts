import { supabase } from '../lib/supabaseClient';

// Lancer une recherche rapide
export async function startFastSearch(briefId: string, validatedSolutions: string[]) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    
    const response = await fetch('/functions/v1/fast-search-handler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'start_fast_search',
        brief_id: briefId,
        validated_solutions: validatedSolutions
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to start fast search');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error starting fast search:', error);
    throw error;
  }
}

// Récupérer les résultats de recherche
export async function getFastSearchResults(briefId: string, searchId?: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    
    const response = await fetch('/functions/v1/fast-search-handler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'get_fast_search_results',
        brief_id: briefId,
        search_id: searchId
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get search results');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting search results:', error);
    throw error;
  }
}
