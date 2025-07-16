import { useI18n } from '../../contexts/I18nContext';

const LanguageSelector = () => {
  const { locale, changeLocale, isLoading } = useI18n();

  const handleLanguageChange = (newLocale: 'en' | 'fr') => {
    if (isLoading || locale === newLocale) return;
    changeLocale(newLocale);
  };

  return (
    <div className="relative flex items-center bg-gray-200 rounded-full p-1 w-24 h-9">
      {/* Moving background */}
      <div
        className={`absolute top-1 left-1 h-7 w-1/2 bg-green-500 rounded-full shadow-md transform transition-transform duration-300 ease-in-out`}
        style={{ transform: locale === 'fr' ? 'translateX(calc(100% - 4px))' : 'translateX(0)' }}
      />

      {/* Buttons */}
      <button
        onClick={() => handleLanguageChange('en')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center text-sm font-bold rounded-full transition-colors duration-300 ${locale === 'en' ? 'text-white' : 'text-gray-600'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`relative z-10 w-1/2 h-full flex items-center justify-center text-sm font-bold rounded-full transition-colors duration-300 ${locale === 'fr' ? 'text-white' : 'text-gray-600'}`}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSelector;
