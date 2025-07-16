import React, { useState } from 'react';

interface DeepSearchRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (additionalInfo: string) => void;
}

const DeepSearchRequestModal: React.FC<DeepSearchRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [additionalInfo, setAdditionalInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(additionalInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Request DeepSights Search</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">Our experts will conduct a detailed search based on your brief. Please provide any additional information that might help.</p>
        
        <div className="mb-4">
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Any specific requirements, preferences, or constraints?"
            className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          DeepSights requests are reviewed by our expert team and typically take 1-2 business days.
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Submit Request</button>
        </div>
      </div>
    </div>
  );
};

export default DeepSearchRequestModal;
