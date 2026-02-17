import { executeEdgeAction } from '../lib/edgeActionHelper';
import { devLog } from '../lib/devTools';

// Nom de la fonction Edge
const EDGE_FUNCTION = 'fast-search-handler';

/**
 * Lancer une recherche rapide (Fast Search)
 * 
 * @param briefId - ID du brief pour lequel lancer la recherche
 * @returns Résultat de la recherche avec l'ID de recherche et le statut
 */
export async function startFastSearch(briefId: string) {
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    const result = await executeEdgeAction(EDGE_FUNCTION, 'start_fast_search', {
      brief_id: briefId
    });
    
    return result;
  } catch (error) {
    console.error('Error starting fast search:', error);
    devLog('Fast Search Error', { briefId, error });
    throw error;
  }
}

/**
 * Lancer une recherche rapide (Fast Search) directement depuis une solution validée
 * 
 * @param briefId - ID du brief pour lequel lancer la recherche
 * @param solutionId - ID de la solution validée à utiliser
 * @param notifyOnCompletion - Si true, l'utilisateur recevra un email quand la recherche sera terminée
 * @returns Résultat de la recherche avec l'ID de recherche et le statut
 */
export async function startFastSearchFromSolution(
  briefId: string, 
  solutionId: string, 
  notifyOnCompletion: boolean = false,
  isTestMode: boolean = false
) {
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    // La logique côté serveur se chargera de vérifier que la solution est validée
    const result = await executeEdgeAction(EDGE_FUNCTION, 'start_fast_search', {
      brief_id: briefId,
      solution_id: solutionId, // L'Edge Function va filtrer pour cette solution spécifique
      notify_on_completion: notifyOnCompletion, // Préférence de notification par email
      is_test: isTestMode // Mode test: utilise le webhook de recette au lieu du webhook de production
    });
    
    return result;
  } catch (error) {
    console.error('Error starting fast search from solution:', error);
    devLog('Fast Search From Solution Error', { briefId, solutionId, notifyOnCompletion, isTestMode, error });
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
