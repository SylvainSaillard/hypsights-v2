import { executeEdgeAction } from '../lib/edgeActionHelper';
import { devLog } from '../lib/devTools';

/**
 * Valider un brief et déclencher l'interprétation via webhook
 * 
 * @param briefId - ID du brief à valider
 * @returns Résultat de la validation avec le statut
 */
export async function validateBrief(briefId: string) {
  if (!briefId) {
    console.error('validateBrief called with invalid briefId:', briefId);
    throw new Error('Brief ID is required for validation');
  }

  console.log('Starting brief validation for ID:', briefId);
  
  try {
    // Utiliser le helper standard pour appeler la fonction Edge
    const result = await executeEdgeAction('brief-operations', 'validate_brief', {
      brief_id: briefId,
      // Ajouter un identifiant unique pour éviter les requêtes dupliquées
      request_id: `validate_${briefId}_${Date.now()}`
    });
    
    console.log('Brief validation successful:', result);
    return result;
  } catch (error) {
    console.error('Error validating brief:', error);
    devLog('Brief Validation Error', { briefId, error });
    
    // Transformer l'erreur en un format plus convivial
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during brief validation';
    throw new Error(`Error validating brief: ${errorMessage}`);
  }
}
