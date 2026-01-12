import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Welcome Card component for new users with no briefs
 * Displays an onboarding tutorial with 3-step journey visualization
 */
const WelcomeCard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 shadow-xl">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative p-8 md:p-12">
        {/* Welcome header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {firstName 
              ? t('welcome.title.personalized', `Welcome to Hypsights, ${firstName}!`, { name: firstName })
              : t('welcome.title.default', 'Welcome to Hypsights!')
            }
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('welcome.subtitle', 'Start your journey to find the perfect suppliers and products for your business needs.')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {step.number}
              </div>
              
              {/* Connector line (between steps) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
              )}
              
              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/dashboard/briefs/new"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('welcome.cta', 'Create my first brief')}
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            {t('welcome.cta_hint', 'It only takes a few minutes to get started')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
