import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useI18n } from '../../contexts/I18nContext';

interface FastSearchQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail: string;
  userName?: string;
}

const FastSearchQuotaModal: React.FC<FastSearchQuotaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  userEmail,
  userName = ''
}) => {
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get user session for authentication
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('User not authenticated');
      }

      // Call Make.com webhook to notify the team
      const webhookData = {
        type: 'fast_search_quota_request',
        userEmail,
        userName,
        phone,
        message,
        timestamp: new Date().toISOString()
      };

      const makeWebhookResponse = await fetch('https://hook.eu1.make.com/sg1brkl4b6fzl82te1k3q3n6x8nt8wvh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (makeWebhookResponse.ok) {
        console.log('Fast Search quota request sent successfully');
        alert(t('fastSearchQuota.modal.success', 'Votre demande a été envoyée ! Notre équipe vous contactera très prochainement pour vous offrir 3 Fast Search supplémentaires.'));
        onSuccess?.();
        onClose();
      } else {
        console.error('Failed to send quota request:', makeWebhookResponse.statusText);
        alert(t('fastSearchQuota.modal.error', 'Échec de l\'envoi de la demande. Veuillez réessayer.'));
      }
    } catch (error) {
      console.error('Error sending quota request:', error);
      alert(t('fastSearchQuota.modal.error', 'Échec de l\'envoi de la demande. Veuillez réessayer.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
        {/* Header with icon */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('fastSearchQuota.modal.title', 'Fast Search Quota Atteint')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t('fastSearchQuota.modal.subtitle', '3/3 recherches utilisées')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                {t('fastSearchQuota.modal.offer.title', '🎁 Offre Spéciale : +3 Fast Search Gratuits')}
              </h3>
              <p className="text-sm text-gray-700">
                {t('fastSearchQuota.modal.offer.description', 'Partagez vos coordonnées avec notre équipe pour un échange rapide sur vos besoins. En retour, recevez immédiatement 3 Fast Search supplémentaires !')}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('fastSearchQuota.modal.benefit1', '3 Fast Search supplémentaires offerts')}
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('fastSearchQuota.modal.benefit2', 'Conseils personnalisés de nos experts')}
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('fastSearchQuota.modal.benefit3', 'Échange rapide (15 min max)')}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('fastSearchQuota.modal.phone.label', 'Numéro de téléphone')} <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('fastSearchQuota.modal.phone.placeholder', '+33 1 23 45 67 89')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('fastSearchQuota.modal.message.label', 'Message (optionnel)')}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('fastSearchQuota.modal.message.placeholder', 'Parlez-nous brièvement de vos besoins...')}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            />
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 rounded-lg mb-6 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            {t('fastSearchQuota.modal.info', 'Notre équipe vous contactera sous 24h pour un échange rapide et vous créditer vos 3 Fast Search.')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            disabled={isSubmitting}
          >
            {t('fastSearchQuota.modal.cancel', 'Plus tard')}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !phone.trim()}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg ${
              isSubmitting || !phone.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('fastSearchQuota.modal.submitting', 'Envoi...')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('fastSearchQuota.modal.submit', 'Obtenir 3 Fast Search')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastSearchQuotaModal;
