import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BriefForm, BriefValidationOverlay } from '../../components/briefs';
import useEdgeFunction from '../../hooks/useEdgeFunction';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';


const BriefCreationPage: React.FC = () => {
  const { briefId } = useParams<{ briefId?: string }>();
  const isEditing = Boolean(briefId);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallingWebhook, setIsCallingWebhook] = useState(false);
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
        // Le brief a été créé ou mis à jour avec succès.
        // submitResponse.data contient la réponse de l'Edge Function (par exemple, { brief: { ... } })
        const createdOrUpdatedBrief = submitResponse.data?.brief;

        if (createdOrUpdatedBrief && createdOrUpdatedBrief.id && createdOrUpdatedBrief.user_id) {
          const briefIdForWebhook = createdOrUpdatedBrief.id;
          console.log('Brief creation/update successful. Brief ID:', briefIdForWebhook);
          setIsCallingWebhook(true);

          // Attendre 500ms avant d'appeler le webhook N8N
          setTimeout(async () => {
            try {
              const n8nPayload = {
                brief_id: briefIdForWebhook,
                user_id: createdOrUpdatedBrief.user_id,
                brief: createdOrUpdatedBrief,
                timestamp: new Date().toISOString(),
                request_id: self.crypto.randomUUID(),
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
              
              const n8nResult = await n8nResponse.json();
              console.log('N8N webhook brief_initialisation successful:', n8nResult);

            } catch (err: unknown) {
              console.error('Error calling N8N webhook:', err);
              const errorMessage = err instanceof Error ? err.message : String(err);
              setError(`Erreur lors de l'appel au webhook N8N: ${errorMessage}`);
            } finally {
              setIsCallingWebhook(false);
              setIsSubmitting(false); // Assurez-vous que isSubmitting est géré correctement
              navigate(`/dashboard/briefs/${briefIdForWebhook}/chat`);
            }
          }, 500);
        } else {
          console.error('Brief data not found in submitResponse or missing id/user_id:', submitResponse.data);
          setError('Erreur: Les données du brief sont incomplètes après la création/mise à jour.');
          setIsSubmitting(false);
          // Optionnel: rediriger vers une page d'erreur ou le dashboard si briefId n'est pas disponible
        }
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing 
            ? t('brief.creation.edit_title', 'Edit Brief') 
            : t('brief.creation.new_title', 'Create New Brief')}
        </h1>
        <p className="text-gray-600">
          {t('brief.creation.subtitle', 'Describe your business needs in detail to get the best matches')}
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Overlay de validation avec animation de chargement */}
      {isCallingWebhook && <BriefValidationOverlay isLoading={isCallingWebhook} />}
      
      {/* Loading overlay */}
      {(isSubmitting || isCallingWebhook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-semibold">
                {isSubmitting 
                  ? t('briefCreation.savingBrief', 'Saving your brief...') 
                  : t('briefCreation.callingWebhook', 'Processing your brief...')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Brief Form */}
      <BriefForm 
        initialData={isEditing ? existingBrief : undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting || submitting || isCallingWebhook}
      />
    </div>
  );
};

export default BriefCreationPage;
