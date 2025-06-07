import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { executeEdgeAction } from '../lib/edgeActionHelper';
import { useAuth } from './AuthContext'; // To get user for get_user_locale

interface Translations {
  [key: string]: string;
}

interface I18nContextType {
  locale: string;
  translations: Translations;
  changeLocale: (newLocale: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<string>(localStorage.getItem('locale') || 'en');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isLoading: authIsLoading } = useAuth();

  const fetchTranslations = useCallback(async (currentLocale: string) => {
    setIsLoading(true);
    try {
      const data = await executeEdgeAction('i18n-handler', 'get_translations', { locale: currentLocale });
      if (data && data.data && data.data.translations) {
        console.log('I18nContext: fetchTranslations - received data.data (full object):', JSON.stringify(data.data, null, 2));
        console.log('I18nContext: fetchTranslations - extracting and setting data.data.translations:', JSON.stringify(data.data.translations, null, 2));
        setTranslations(data.data.translations);
      } else {
        setTranslations({}); // Fallback to empty if no translations found
        console.warn(`No translations found for locale: ${currentLocale}, or data.data.translations is missing.`);
      }
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      setTranslations({}); // Fallback on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const determineInitialLocaleAndFetch = async () => {
      if (authIsLoading) return; // Wait for auth to settle

      let initialLocale = localStorage.getItem('locale');
      if (!initialLocale && user) {
        try {
          const data = await executeEdgeAction('i18n-handler', 'get_user_locale', {});
          if (data && data.locale) {
            initialLocale = data.locale;
          }
        } catch (error) {
          console.error('Failed to fetch user locale:', error);
        }
      }
      initialLocale = initialLocale || 'en'; // Default to 'en'
      
      setLocale(initialLocale);
      localStorage.setItem('locale', initialLocale); // Ensure localStorage is set
      fetchTranslations(initialLocale);
    };

    determineInitialLocaleAndFetch();
  }, [user, authIsLoading, fetchTranslations]);

  // Log translations when they change
  useEffect(() => {
    console.log('I18nContext: translations state updated:', JSON.stringify(translations, null, 2));
  }, [translations]);

  const changeLocale = async (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    setIsLoading(true); // For translations fetch
    try {
      await executeEdgeAction('i18n-handler', 'set_user_locale', { locale: newLocale });
      await fetchTranslations(newLocale);
    } catch (error) {
      console.error('Failed to change locale or fetch new translations:', error);
      // Potentially revert locale change on error or handle gracefully
      setIsLoading(false);
    }
  };

  const t = useCallback((key: string, fallback?: string): string => {
    console.log(`I18nContext: t() called with key='${key}'. Current translations map:`, JSON.stringify(translations, null, 2));
    return translations[key] || fallback || key;
  }, [translations]);

  const value = {
    locale,
    translations,
    changeLocale,
    t,
    isLoading
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
