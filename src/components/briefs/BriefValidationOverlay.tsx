import React, { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/design-tokens.css';

interface BriefValidationOverlayProps {
  isLoading: boolean;
}

interface ProcessingStep {
  id: string;
  label: string;
  icon: string;
  duration: number; // in seconds
}

/**
 * Overlay component shown during brief validation with progressive animation
 * Simule le traitement backend avec des étapes visuelles (30s-1mn)
 */
const BriefValidationOverlay: React.FC<BriefValidationOverlayProps> = ({ isLoading }) => {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  
  // Define steps outside of component to avoid recreation on every render
  const processingSteps: ProcessingStep[] = React.useMemo(() => [
    {
      id: 'analyzing',
      label: t('brief.validation.step.analyzing', 'Analyzing your brief requirements'),
      icon: '🔍',
      duration: 12
    },
    {
      id: 'matching',
      label: t('brief.validation.step.matching', 'Finding matching solutions'),
      icon: '🎯',
      duration: 15
    },
    {
      id: 'researching',
      label: t('brief.validation.step.researching', 'Researching reference companies'),
      icon: '🏢',
      duration: 18
    },
    {
      id: 'finalizing',
      label: t('brief.validation.step.finalizing', 'Finalizing recommendations'),
      icon: '✨',
      duration: 10
    }
  ], [t]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      setStepProgress(0);
      return;
    }

    let totalElapsed = 0;
    const totalDuration = processingSteps.reduce((sum, step) => sum + step.duration, 0);
    
    const interval = setInterval(() => {
      totalElapsed += 0.5;
      
      // Calculate which step we're in
      let stepElapsed = 0;
      let newCurrentStep = 0;
      
      for (let i = 0; i < processingSteps.length; i++) {
        if (totalElapsed <= stepElapsed + processingSteps[i].duration) {
          newCurrentStep = i;
          break;
        }
        stepElapsed += processingSteps[i].duration;
        newCurrentStep = i + 1;
      }
      
      setCurrentStep(Math.min(newCurrentStep, processingSteps.length - 1));
      
      // Calculate step progress
      const currentStepElapsed = totalElapsed - stepElapsed;
      const currentStepDuration = processingSteps[Math.min(newCurrentStep, processingSteps.length - 1)]?.duration || 1;
      setStepProgress(Math.min((currentStepElapsed / currentStepDuration) * 100, 100));
      
      // Calculate overall progress
      const overallProgress = Math.min((totalElapsed / totalDuration) * 100, 95);
      setProgress(overallProgress);
      
      console.log('Animation Debug:', {
        totalElapsed,
        totalDuration,
        overallProgress,
        currentStep: newCurrentStep,
        stepProgress: (currentStepElapsed / currentStepDuration) * 100
      });
      
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]); // Removed processingSteps dependency to avoid recreation
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border border-gray-100">
        <div className="flex flex-col items-center">
          {/* Main icon with animation */}
          <div className="mb-6 relative">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
              <div className="text-4xl animate-pulse">
                {processingSteps[currentStep]?.icon || '🔄'}
              </div>
            </div>
            {/* Rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-center text-gray-900">
            {t('brief.validation.processing_title', 'Processing Your Brief')}
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            {t('brief.validation.processing_message', 'Our AI is working hard to find the best matches for you')}
          </p>
          
          {/* Overall progress bar */}
          <div className="w-full mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{t('brief.validation.progress', 'Progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Current step */}
          <div className="w-full mb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="text-2xl mr-3 animate-bounce">
                {processingSteps[currentStep]?.icon}
              </div>
              <p className="text-sm font-medium text-gray-700 text-center">
                {processingSteps[currentStep]?.label}
              </p>
            </div>
            
            {/* Step progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div 
                className="bg-blue-400 h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${stepProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Steps indicator */}
          <div className="flex space-x-2 mt-4">
            {processingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('brief.validation.estimated_time', 'This usually takes 30-60 seconds')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BriefValidationOverlay;
