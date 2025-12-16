import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface FastSearchLaunchModalProps {
  isOpen: boolean;
  solutionTitle: string;
  solutionNumber?: number;
  onConfirm: (notifyByEmail: boolean) => void;
  onCancel: () => void;
}

/**
 * Modal affiché lors du lancement d'une Fast Search
 * Informe l'utilisateur que le processus prend du temps et propose des options
 */
const FastSearchLaunchModal: React.FC<FastSearchLaunchModalProps> = ({
  isOpen,
  solutionTitle,
  solutionNumber,
  onConfirm,
  onCancel
}) => {
  const { t } = useI18n();
  const [notifyByEmail, setNotifyByEmail] = useState(false);

  if (!isOpen) return null;

  const handleStayOnPage = () => {
    onConfirm(notifyByEmail);
  };

  const handleLeaveAndReturn = () => {
    onConfirm(notifyByEmail);
    // L'utilisateur peut naviguer librement après avoir lancé la recherche
  };

  const solutionDisplayName = solutionNumber 
    ? `${t('solution.title', 'Solution')} #${solutionNumber}` 
    : solutionTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header avec icône */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('fast_search_modal.title', 'Fast Search Started')}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {solutionDisplayName}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          {/* Message principal */}
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                {t('fast_search_modal.processing_message', 'The search process may take a few minutes.')}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {t('fast_search_modal.processing_description', 'We are searching for the best suppliers matching your solution criteria.')}
              </p>
            </div>
          </div>
          
          {/* Options */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">
              {t('fast_search_modal.options_title', 'What would you like to do?')}
            </p>
            
            <div className="space-y-3">
              {/* Option 1: Rester sur la page */}
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t('fast_search_modal.option_stay', 'Stay on this page')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('fast_search_modal.option_stay_desc', 'Watch the results appear in real-time')}
                  </p>
                </div>
              </div>
              
              {/* Option 2: Quitter et revenir */}
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t('fast_search_modal.option_leave', 'Leave and come back later')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('fast_search_modal.option_leave_desc', 'Results will be saved and available when you return')}
                  </p>
                </div>
              </div>
              
              {/* Option 3: Notification email */}
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={notifyByEmail}
                    onChange={(e) => setNotifyByEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {t('fast_search_modal.option_email', 'Notify me by email')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('fast_search_modal.option_email_desc', 'Receive an email when the search is complete')}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer avec boutons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('fast_search_modal.button_cancel', 'Cancel')}
          </button>
          <button
            onClick={handleStayOnPage}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            {t('fast_search_modal.button_confirm', 'Start Search')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastSearchLaunchModal;
