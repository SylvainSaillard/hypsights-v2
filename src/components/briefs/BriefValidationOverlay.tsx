import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';

interface BriefValidationOverlayProps {
  isLoading: boolean;
}

/**
 * Overlay component shown during brief validation
 * Conforme au principe KISS et Thin Client / Fat Edge
 */
const BriefValidationOverlay: React.FC<BriefValidationOverlayProps> = ({ isLoading }) => {
  const { t } = useI18n();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="flex flex-col items-center">
          {/* Processing icon */}
          <div className="mb-6 p-4 bg-primary bg-opacity-10 rounded-full">
            <svg className="w-10 h-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-center text-gray-900">
            {t('brief.validation.processing_title', 'Processing Your Brief')}
          </h2>
          
          <p className="text-gray-600 mb-8 text-center">
            {t('brief.validation.processing_message', 'Please wait while we process your brief...')}
          </p>
          
          {/* Loading indicator */}
          <div className="relative">
            <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse rounded-full"></div>
            </div>
            <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-gray-500">
              {t('brief.validation.ai_processing', 'AI is analyzing your requirements')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefValidationOverlay;
