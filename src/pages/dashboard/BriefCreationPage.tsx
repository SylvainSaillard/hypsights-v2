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
        
        // Lancer la validation du brief et l'interprétation via webhook
        setIsValidating(true);
        validateBrief(briefId)
          .then(() => {
            // Redirection vers la page de chat du brief après validation réussie
            navigate(`/dashboard/briefs/${briefId}/chat`);
          })
          .catch((err) => {
            setError(`Erreur lors de la validation du brief: ${err.message}`);
            // Rediriger quand même vers la page de chat en cas d'erreur
            navigate(`/dashboard/briefs/${briefId}/chat`);
          })
          .finally(() => {
            setIsValidating(false);
            setIsSubmitting(false);
          });
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
