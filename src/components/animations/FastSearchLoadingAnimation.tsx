import { useEffect, useState, useRef } from 'react';

interface FastSearchLoadingAnimationProps {
  briefTitle?: string;
}

/**
 * Animation gamifiée pour le processus Fast Search
 * Affiche les étapes de recherche avec animations et progression
 */
export function FastSearchLoadingAnimation({ briefTitle }: FastSearchLoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const animationRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      icon: '🔍',
      title: 'Analyzing your brief',
      description: 'Understanding your requirements and criteria',
      duration: 3000
    },
    {
      icon: '🏢',
      title: 'Searching companies',
      description: 'Scanning our database of suppliers worldwide',
      duration: 4000
    },
    {
      icon: '📦',
      title: 'Finding products',
      description: 'Matching products to your solutions',
      duration: 4000
    },
    {
      icon: '🎯',
      title: 'Scoring matches',
      description: 'Calculating compatibility scores',
      duration: 3000
    },
    {
      icon: '✨',
      title: 'Finalizing results',
      description: 'Preparing your personalized recommendations',
      duration: 2000
    }
  ];

  // Auto-scroll vers l'animation au montage
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);

  // Progression automatique des étapes
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        // Revenir au début pour créer une boucle infinie
        return 0;
      });
    }, 5000); // Ralenti pour un effet plus naturel

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div ref={animationRef} className="w-full py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header avec titre animé */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 animate-pulse shadow-2xl">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Fast Search in Progress
          </h2>
          
          {briefTitle && (
            <p className="text-gray-600 text-lg">
              Searching for: <span className="font-semibold text-gray-800">{briefTitle}</span>
            </p>
          )}
          
          <p className="text-gray-500 mt-2">
            Our AI is analyzing thousands of suppliers to find your perfect matches
          </p>
        </div>

        {/* Animation de sablier tournant */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-32 h-32">
            {/* Cercle extérieur tournant */}
            <div className="absolute inset-0 rounded-full border-8 border-gray-200 border-t-blue-500 border-r-purple-500 animate-spin"></div>
            
            {/* Cercle intérieur tournant en sens inverse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-6 border-transparent border-b-purple-400 border-l-blue-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
            </div>
            
            {/* Icône centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Étapes de recherche */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className={`
                  relative flex items-start gap-4 p-6 rounded-2xl border-2 transition-all duration-500
                  ${isActive ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg scale-105' : ''}
                  ${isCompleted ? 'bg-green-50 border-green-300' : ''}
                  ${isPending ? 'bg-gray-50 border-gray-200 opacity-60' : ''}
                `}
              >
                {/* Icône de l'étape */}
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-500
                  ${isActive ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl animate-bounce' : ''}
                  ${isCompleted ? 'bg-green-500' : ''}
                  ${isPending ? 'bg-gray-300' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={isActive || isCompleted ? 'filter drop-shadow-lg' : ''}>
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Contenu de l'étape */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-lg font-bold mb-1 transition-colors duration-300
                    ${isActive ? 'text-blue-700' : ''}
                    ${isCompleted ? 'text-green-700' : ''}
                    ${isPending ? 'text-gray-500' : ''}
                  `}>
                    {step.title}
                  </h3>
                  <p className={`
                    text-sm transition-colors duration-300
                    ${isActive ? 'text-blue-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}>
                    {step.description}
                  </p>

                  {/* Barre de progression de l'étape active */}
                  {isActive && (
                    <div className="mt-3 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                           style={{ 
                             width: '100%',
                             animation: 'progressBar 3s ease-in-out infinite'
                           }}>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge de statut */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    IN PROGRESS
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message d'encouragement */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full">
            <span className="text-2xl animate-bounce">⚡</span>
            <p className="text-amber-800 font-medium">
              First finding usually takes a few minutes
            </p>
          </div>
        </div>

        {/* Statistiques en temps réel (simulées) */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="animate-pulse">🔍</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">Scanning the Internet For Companies</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              <span className="animate-pulse">📦</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">Identifying Matching Products</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              <span className="animate-pulse">🎯</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">Recommending 10+ Best Companies</div>
          </div>
        </div>
      </div>

    </div>
  );
}
