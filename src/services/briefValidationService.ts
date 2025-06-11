import { executeEdgeAction } from '../lib/edgeActionHelper';
import { devLog } from '../lib/devTools';

/**
 * Valider un brief et déclencher l'interprétation via webhook
 * 
 * @param briefId - ID du brief à valider
 * @returns Résultat de la validation avec le statut
 */
export async function validateBrief(briefId: string) {
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    const result = await executeEdgeAction('brief-operations', 'validate_brief', {
      brief_id: briefId
    });
    
    return result;
  } catch (error) {
    console.error('Error validating brief:', error);
    devLog('Brief Validation Error', { briefId, error });
    throw error;
  }
}
