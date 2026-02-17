import React, { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

interface FastSearchLaunchModalProps {
  isOpen: boolean;
  solutionTitle: string;
  solutionNumber?: number;
  isTestMode?: boolean;
  onConfirm: (notifyByEmail: boolean, stayOnPage: boolean) => void;
  onCancel: () => void;
}

/**
 * Modal affiché lors du lancement d'une Fast Search
 * Informe l'utilisateur que le processus prend du temps et propose des options
 * 
 * UX Design:
 * - "Stay & Watch": Lance la recherche et reste sur la page (comportement actuel)
 * - "Leave": Lance la recherche et redirige vers le dashboard, avec option email
 */
const FastSearchLaunchModal: React.FC<FastSearchLaunchModalProps> = ({
  isOpen,
  solutionTitle,
  solutionNumber,
  isTestMode = false,
  onConfirm,
  onCancel
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [notifyByEmail, setNotifyByEmail] = useState(false);

  if (!isOpen) return null;

  const handleStayAndWatch = () => {
    onConfirm(notifyByEmail, true); // Use checkbox value, stay on page
  };

  const handleLeave = () => {
    onConfirm(notifyByEmail, false); // Use checkbox value, leave page
    navigate('/dashboard'); // Redirect to dashboard
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header avec icône */}
        <div className={`px-6 py-5 ${isTestMode ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {isTestMode ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isTestMode 
                  ? t('fast_search_modal.title_test', '🧪 Test Fast Search')
                  : t('fast_search_modal.title', 'Launch Fast Search')}
              </h2>
              <p className={`text-sm mt-0.5 ${isTestMode ? 'text-orange-100' : 'text-blue-100'}`}>
                {solutionDisplayName}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          {/* Message principal */}
          <div className="flex items-start gap-3 mb-6">
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
          
          {/* Option email notification - associée au bouton Leave */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-800">
                    {t('fast_search_modal.option_email', 'Notify me by email when complete')}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  {t('fast_search_modal.option_email_desc', 'Receive an email notification when the search is finished')}
                </p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Footer avec 2 boutons d'action + Cancel */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col gap-3">
            {/* Boutons d'action principaux */}
            <div className="flex gap-3">
              <button
                onClick={handleLeave}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('fast_search_modal.button_leave', 'Launch & Leave')}
              </button>
              <button
                onClick={handleStayAndWatch}
                className={`flex-1 py-3 px-4 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  isTestMode 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('fast_search_modal.button_stay', 'Launch & Watch')}
              </button>
            </div>
            
            {/* Bouton Cancel discret */}
            <button
              onClick={onCancel}
              className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              {t('fast_search_modal.button_cancel', 'Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastSearchLaunchModal;
