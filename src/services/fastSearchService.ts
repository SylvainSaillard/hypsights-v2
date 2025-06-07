import { executeEdgeAction } from '../lib/edgeActionHelper';
import { devLog } from '../lib/devTools';

// Nom de la fonction Edge
const EDGE_FUNCTION = 'fast-search-handler';

/**
 * Lancer une recherche rapide (Fast Search)
 * 
 * @param briefId - ID du brief pour lequel lancer la recherche
 * @param validatedSolutions - Solutions validées à utiliser pour la recherche
 * @returns Résultat de la recherche avec l'ID de recherche et le statut
 */
export async function startFastSearch(briefId: string, validatedSolutions: string[]) {
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    const result = await executeEdgeAction(EDGE_FUNCTION, 'start_fast_search', {
      brief_id: briefId,
      validated_solutions: validatedSolutions
    });
    
    return result;
  } catch (error) {
    console.error('Error starting fast search:', error);
    devLog('Fast Search Error', { briefId, validatedSolutions, error });
    throw error;
  }
}

/**
 * Récupérer les résultats d'une recherche rapide
 * 
 * @param briefId - ID du brief pour lequel récupérer les résultats
 * @param searchId - ID optionnel de la recherche spécifique
 * @returns Résultats de la recherche avec fournisseurs et produits
 */
export async function getFastSearchResults(briefId: string, searchId?: string) {
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    const result = await executeEdgeAction(EDGE_FUNCTION, 'get_fast_search_results', {
      brief_id: briefId,
      search_id: searchId
    });
    
    return result;
  } catch (error) {
    console.error('Error getting search results:', error);
    devLog('Fast Search Results Error', { briefId, searchId, error });
    throw error;
  }
}
