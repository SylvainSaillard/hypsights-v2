import React, { useState, useEffect } from 'react';
import { useSolutions } from '../../hooks/useSolutions';
import DeepSearchRequestModal from '../modals/DeepSearchRequestModal';

interface PremiumDeepSearchCTAProps {
  briefId: string;
  autoShowModal?: boolean;
}

const PremiumDeepSearchCTA: React.FC<PremiumDeepSearchCTAProps> = ({ briefId, autoShowModal = false }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { solutions } = useSolutions(briefId);

  // Auto-show modal when all solutions are finished
  useEffect(() => {
    if (autoShowModal && solutions.length > 0) {
      const allSolutionsFinished = solutions.every(solution => 
        solution.status === 'finished' || solution.status === 'rejected'
      );
      
      if (allSolutionsFinished) {
        setModalOpen(true);
      }
    }
  }, [autoShowModal, solutions]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleSubmitRequest = (additionalInfo: string) => {
    console.log('Deep Search Request Submitted for brief:', briefId);
    console.log('Additional Information:', additionalInfo);
    // Here you would typically call an Edge Function to process the request
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white my-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Premium Deep Search
            </h2>
            <p className="mt-2 max-w-2xl">Get VIP treatment with our expert team providing personalized, hand-curated solutions and exclusive market insights.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="expert">🎯</span><span className="ml-1.5">Expert Analysis</span></span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="premium">💎</span><span className="ml-1.5">Premium Results</span></span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center"><span role="img" aria-label="exclusive">✨</span><span className="ml-1.5">Exclusive Access</span></span>
            </div>
          </div>
          <button 
            onClick={handleOpenModal}
            className="mt-6 bg-white text-purple-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Access deep search
          </button>
        </div>
      </div>

      <DeepSearchRequestModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitRequest} 
      />
    </>
  );
};

export default PremiumDeepSearchCTA;
