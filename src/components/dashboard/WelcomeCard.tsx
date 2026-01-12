import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Welcome Card component for new users with no briefs
 * Displays an onboarding tutorial with 3-step journey visualization
 * Features animated entrance and interactive elements
 */
const WelcomeCard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Trigger entrance animation on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Animate through steps sequentially
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 2000);
    
    return () => clearInterval(stepInterval);
  }, []);
  
  // Extract first name from user metadata or email
  const firstName = user?.user_metadata?.first_name 
    || user?.email?.split('@')[0] 
    || '';

  const steps = [
    {
      number: 1,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: t('welcome.step1.title', 'Describe your need'),
      description: t('welcome.step1.description', 'Create a brief describing what products or solutions you\'re looking for'),
    },
    {
      number: 2,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l.707.707m12.728 0l-.707.707M12 21v-1" />
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
        </svg>
      ),
      title: t('welcome.step2.title', 'AI finds solutions'),
      description: t('welcome.step2.description', 'Our AI analyzes your brief and suggests relevant solutions'),
    },
    {
      number: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: t('welcome.step3.title', 'Discover suppliers'),
      description: t('welcome.step3.description', 'Get a curated list of suppliers matching your requirements'),
    },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 shadow-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Animated background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-green-200/40 to-blue-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '20s' }}></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
      <div className="absolute top-32 right-32 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-24 right-20 w-4 h-4 bg-green-400/30 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}></div>
      
      <div className="relative p-8 md:p-12">
        {/* Welcome header with entrance animation */}
        <div className={`text-center mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">
            {firstName 
              ? t('welcome.title.personalized', `Welcome to Hypsights, ${firstName}!`, { name: firstName })
              : t('welcome.title.default', 'Welcome to Hypsights!')
            }
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('welcome.subtitle', 'Start your journey to find the perfect suppliers and products for your business needs.')}
          </p>
        </div>

        {/* Steps with staggered entrance animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-default ${
                activeStep === index + 1 
                  ? 'border-blue-400 shadow-lg shadow-blue-100 scale-[1.02]' 
                  : 'border-white/50 shadow-md hover:border-blue-200'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              {/* Step number badge with pulse when active */}
              <div className={`absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform duration-300 ${activeStep === index + 1 ? 'scale-125 animate-pulse' : ''}`}>
                {step.number}
              </div>
              
              {/* Animated connector line (between steps) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 w-6 items-center">
                  <div className={`h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500 ${activeStep > index + 1 ? 'w-full' : 'w-0'}`}></div>
                  <div className={`absolute right-0 w-2 h-2 rounded-full bg-indigo-400 transition-all duration-300 ${activeStep > index + 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center pt-2">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  activeStep === index + 1 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600'
                }`}>
                  {step.icon}
                </div>
                <h3 className={`font-semibold mb-2 transition-colors duration-300 ${activeStep === index + 1 ? 'text-blue-700' : 'text-gray-900'}`}>{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA with enhanced animation */}
        <div className={`text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            to="/dashboard/briefs/new"
            className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            
            <svg xmlns="http://www.w3.org/2000/svg" className="relative h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative">{t('welcome.cta', 'Create my first brief')}</span>
          </Link>
          <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('welcome.cta_hint', 'It only takes a few minutes to get started')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
