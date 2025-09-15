import React, { useState, useEffect } from 'react';
import DeepSearchRequestModal from '../modals/DeepSearchRequestModal';
import { useI18n } from '../../contexts/I18nContext';

interface PremiumDeepSearchCTAProps {
  briefId: string;
  autoShowModal?: boolean;
  solutions?: Array<{id: string; status: string}>;
  briefTitle?: string;
  briefDescription?: string;
  userEmail?: string;
  deepSearchRequested?: boolean;
  onDeepSearchSubmitted?: () => void;
}

const PremiumDeepSearchCTA: React.FC<PremiumDeepSearchCTAProps> = ({ 
  briefId, 
  autoShowModal = false, 
  solutions = [], 
  briefTitle = '', 
  briefDescription = '', 
  userEmail = '',
  deepSearchRequested = false,
  onDeepSearchSubmitted
}) => {
  const { t } = useI18n();
  const [isModalOpen, setModalOpen] = useState(false);

  // Auto-show modal when all solutions are finished (but not if deep search already requested)
  useEffect(() => {
    if (autoShowModal && solutions.length > 0 && !deepSearchRequested) {
      console.log('PremiumDeepSearchCTA - Checking solutions for auto-popup:', solutions);
      
      const allSolutionsFinished = solutions.every(solution => 
        solution.status === 'finished' || solution.status === 'rejected'
      );
      
      console.log('PremiumDeepSearchCTA - All solutions finished?', allSolutionsFinished);
      
      if (allSolutionsFinished) {
        console.log('PremiumDeepSearchCTA - Opening modal automatically');
        setModalOpen(true);
      }
    }
  }, [autoShowModal, solutions, deepSearchRequested]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  
  const handleSubmitRequest = (additionalInfo: string) => {
    console.log('Deep Search Request Submitted for brief:', briefId);
    console.log('Additional Information:', additionalInfo);
    setModalOpen(false);
    // Notify parent component that deep search was submitted
    onDeepSearchSubmitted?.();
  };

  return (
    <>
      {deepSearchRequested ? (
        // State when deep search has been requested
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white my-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('deepSearch.requested.title', 'Deep Search Requested')}
              </h2>
              <p className="mt-2 max-w-2xl">{t('deepSearch.requested.description', 'Votre demande de recherche approfondie a été transmise à notre équipe d\'experts. L\'équipe Hypsights va vous recontacter très prochainement avec des résultats personnalisés.')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="processing">⏳</span><span className="ml-1.5">{t('deepSearch.requested.processing', 'En cours de traitement')}</span></span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="expert">👥</span><span className="ml-1.5">{t('deepSearch.requested.expertTeam', 'Équipe d\'experts')}</span></span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="contact">📞</span><span className="ml-1.5">{t('deepSearch.requested.contactSoon', 'Contact imminent')}</span></span>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <p className="text-sm font-medium">{t('deepSearch.requested.sent', 'Demande envoyée')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Original state when deep search hasn't been requested
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white my-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {t('deepSearch.cta.title', 'Premium Deep Search')}
              </h2>
              <p className="mt-2 max-w-2xl">{t('deepSearch.cta.description', 'Get VIP treatment with our expert team providing personalized, hand-curated solutions and exclusive market insights.')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="expert">🎯</span><span className="ml-1.5">{t('deepSearch.cta.expertAnalysis', 'Expert Analysis')}</span></span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="premium">💎</span><span className="ml-1.5">{t('deepSearch.cta.premiumResults', 'Premium Results')}</span></span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="exclusive">✨</span><span className="ml-1.5">{t('deepSearch.cta.exclusiveAccess', 'Exclusive Access')}</span></span>
              </div>
            </div>
            <button 
              onClick={handleOpenModal}
              className="mt-6 bg-white text-purple-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {t('deepSearch.cta.button', 'Access deep search')}
            </button>
          </div>
        </div>
      )}

      <DeepSearchRequestModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitRequest}
        briefId={briefId}
        briefTitle={briefTitle}
        briefDescription={briefDescription}
        userEmail={userEmail}
      />
    </>
  );
};

export default PremiumDeepSearchCTA;
