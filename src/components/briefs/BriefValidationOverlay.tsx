import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface BriefValidationOverlayProps {
  isLoading: boolean;
}

/**
 * Composant d'overlay pour afficher l'animation de chargement pendant la validation du brief
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
const BriefValidationOverlay: React.FC<BriefValidationOverlayProps> = ({ isLoading }) => {
  const { t } = useI18n();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">
          {t('brief.validation.processing_title', 'Processing Your Brief')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('brief.validation.processing_message', 'We are analyzing your brief to provide the best recommendations. This may take a few moments...')}
        </p>
      </div>
    </div>
  );
};

export default BriefValidationOverlay;
