import { useEffect, useState } from 'react';
import { X, RefreshCw, Info } from 'lucide-react';

interface FastSearchRefundNotificationProps {
  solutionTitle: string;
  reason: string;
  locale: 'en' | 'fr';
  onClose: () => void;
}

const MESSAGES = {
  en: {
    title: 'Fast Search Credit Restored',
    noResults: 'No suppliers were found for this search',
    workflowIssue: 'The search could not be completed',
    generic: 'The search did not return results',
    credit: 'Your Fast Search credit has been automatically restored',
    close: 'Close'
  },
  fr: {
    title: 'Crédit Fast Search Restauré',
    noResults: 'Aucun fournisseur n\'a été trouvé pour cette recherche',
    workflowIssue: 'La recherche n\'a pas pu être complétée',
    generic: 'La recherche n\'a pas retourné de résultats',
    credit: 'Votre crédit Fast Search a été automatiquement restauré',
    close: 'Fermer'
  }
};

export function FastSearchRefundNotification({
  solutionTitle,
  reason,
  locale,
  onClose
}: FastSearchRefundNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const messages = MESSAGES[locale];

  // Animation d'entrée
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Auto-fermeture après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Attendre la fin de l'animation
  };

  // Déterminer le message en fonction de la raison
  const getReasonMessage = () => {
    if (reason.includes('No suppliers found')) {
      return messages.noResults;
    } else if (reason.includes('workflow') || reason.includes('failed')) {
      return messages.workflowIssue;
    }
    return messages.generic;
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-blue-100 overflow-hidden">
        {/* Header avec dégradé */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-semibold">{messages.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label={messages.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-3">
          {/* Solution concernée */}
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {solutionTitle}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getReasonMessage()}
              </p>
            </div>
          </div>

          {/* Message de crédit restauré */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              {messages.credit}
            </p>
          </div>
        </div>

        {/* Barre de progression pour l'auto-fermeture */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-[10000ms] ease-linear"
            style={{ width: isVisible ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
