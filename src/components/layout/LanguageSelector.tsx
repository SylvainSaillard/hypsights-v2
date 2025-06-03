import React, { useState, useRef, useEffect } from 'react';
import useEdgeFunction from '../../hooks/useEdgeFunction';

type Language = {
  code: string;
  name: string;
  flag: string;
};

/**
 * Language Selector Component
 * Allows users to switch between languages (FR/EN priority)
 * Integrates with i18n-handler.ts Edge Function
 */
const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(localStorage.getItem('locale') || 'en');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch available languages
  const { 
    data: languagesData, 
    loading, 
    error
  } = useEdgeFunction('i18n-handler', {
    action: 'get_languages'
  }, 'POST');
  
  const languages: Language[] = languagesData?.languages || [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Change language function
  const changeLanguage = async (locale: string) => {
    try {
      // Store selected locale in localStorage
      localStorage.setItem('locale', locale);
      setCurrentLocale(locale);
      
      // Notify the Edge Function about the language change
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/i18n-handler`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'set_user_locale',
          locale
        })
      });
      
      // Reload the page to apply translations
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to change language:', error);
    }
    
    setIsOpen(false);
  };
  
  // Find current language object
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center space-x-1 py-1 px-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    console.error('Error loading languages:', error);
    // We already have fallback languages defined in the initial languages constant
    // No need to reassign, just log the error
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${currentLocale === language.code ? 'bg-gray-50 font-medium' : ''}`}
                onClick={() => changeLanguage(language.code)}
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
