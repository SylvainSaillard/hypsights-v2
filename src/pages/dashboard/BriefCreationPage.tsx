import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BriefForm from '../../components/briefs/BriefForm';
import BriefValidationOverlay from '../../components/briefs/BriefValidationOverlay';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import { validateBrief } from '../../services/briefValidationService';

const BriefCreationPage: React.FC = () => {
  const { briefId } = useParams<{ briefId?: string }>();
  const isEditing = Boolean(briefId);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  
  // Si on édite, charger le brief existant
  const { 
    data: existingBriefData, 
    loading: briefLoading, 
    error: briefError 
  } = useEdgeFunction(
    'brief-operations', 
    isEditing ? { action: 'get_brief', brief_id: briefId } : {}, // Utiliser objet vide pour respecter le type attendu
    'POST'
  );

  // Extraire les données du brief
  const existingBrief = existingBriefData?.brief || existingBriefData?.data?.brief;

  // Créer un état pour stocker les paramètres de soumission
  const [submitParams, setSubmitParams] = useState<Record<string, any>>({});
  
  // Hook pour la création/mise à jour du brief
  const { 
    loading: submitting,
    error: submitError,
    data: submitResponse
  } = useEdgeFunction(
    'brief-operations',
    submitParams, // Utiliser l'état pour les paramètres
    'POST'
  );

  // Gestion de la réponse après soumission
  useEffect(() => {
    if (submitResponse && !submitting) {
      // Extraire l'ID du brief de la réponse
      let briefId = submitResponse.brief_id || 
                   (submitResponse.brief && submitResponse.brief.id) || 
                   (submitResponse.data && submitResponse.data.brief_id);
      
      if (briefId) {
        console.log('Brief créé/mis à jour avec succès, ID:', briefId);
        
        // Lancer la validation du brief et l'interprétation via webhook après un court délai
        // Ce délai permet d'éviter les problèmes de concurrence entre création et validation
        setIsValidating(true);
        
        // Attendre 500ms avant de lancer la validation du statut et l'appel webhook
        setTimeout(async () => {
          try {
            console.log('Starting brief status update for ID:', briefId);
            const validationResult = await validateBrief(briefId); // Met à jour le statut via Edge Function
            console.log('Brief status update successful:', validationResult);

            // Préparer les données pour le webhook N8N brief_initialisation
            const briefForWebhook = validationResult?.brief || (validationResult?.data?.brief);
            if (!briefForWebhook || !briefForWebhook.user_id) {
              throw new Error("Validated brief data is missing or incomplete for N8N webhook.");
            }

            const n8nPayload = {
              brief_id: briefId,
              user_id: briefForWebhook.user_id,
              brief: briefForWebhook,
              timestamp: new Date().toISOString(),
              request_id: self.crypto.randomUUID(), // Génère un UUID côté client
            };

            console.log('Calling N8N brief_initialisation webhook with payload:', n8nPayload);
            const n8nResponse = await fetch('https://n8n.proxiwave.com/webhook/brief_initialisation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(n8nPayload),
            });

            if (!n8nResponse.ok) {
              const errorText = await n8nResponse.text();
              throw new Error(`N8N webhook brief_initialisation failed: ${n8nResponse.status} ${errorText}`);
            }
            
            const n8nResult = await n8nResponse.json(); // Supposant que N8N retourne du JSON
            console.log('N8N webhook brief_initialisation successful:', n8nResult);

          } catch (err: unknown) { // Specify type for err
            console.error('Error during status update or N8N webhook call:', err);
            // Afficher l'erreur à l'utilisateur. La navigation se fait dans finally.
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Erreur post-création du brief: ${errorMessage}`);
          } finally {
            // Quoi qu'il arrive (succès ou échec du webhook N8N), on termine la validation et on navigue
            setIsValidating(false);
            setIsSubmitting(false);
            navigate(`/dashboard/briefs/${briefId}/chat`);
          }
        }, 500);

      }
    }
  }, [submitResponse, submitting, navigate]);

  // Gestion des erreurs de soumission
  useEffect(() => {
    if (submitError) {
      setError(submitError);
      setIsSubmitting(false);
    }
  }, [submitError]);

  // Fonction de soumission du formulaire
  const handleFormSubmit = async (briefData: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Définir les paramètres pour l'appel à la fonction Edge
      setSubmitParams({
        action: isEditing ? 'update_brief' : 'create_brief',
        brief_id: isEditing ? briefId : undefined,
        brief_data: briefData
      });
      
      // L'appel sera déclenché automatiquement quand submitParams change grâce au useEffect du hook
      
      // La redirection est gérée par l'useEffect sur submitResponse
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (isEditing && briefLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-lg">{t('brief.creation.loading_existing', 'Loading brief data...')}</div>
      </div>
    );
  }

  if (isEditing && briefError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <h2 className="text-lg font-medium text-red-800">{t('brief.creation.error.load_title', 'Error Loading Brief')}</h2>
        <p className="text-sm text-red-700 mt-2">{briefError}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
        >
          {t('brief.creation.button.back_to_dashboard', 'Return to Dashboard')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Overlay de validation avec animation de chargement */}
      <BriefValidationOverlay isLoading={isValidating} />
      
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? t('brief.creation.title.edit', 'Edit Brief') : t('brief.creation.title.create', 'Create New Brief')}
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <BriefForm 
        initialData={isEditing ? existingBrief : undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting || submitting || isValidating}
      />
    </div>
  );
};

export default BriefCreationPage;
