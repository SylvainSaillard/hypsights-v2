import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

interface FastSearchBarProps {
  isReady: boolean;
  quotaUsed: number;
  quotaTotal: number;
  onLaunchSearch: () => void;
}

/**
 * Barre d'état et de lancement de Fast Search
 * Affiche le statut de validation des solutions et le quota restant
 */
const FastSearchBar: React.FC<FastSearchBarProps> = ({
  isReady,
  quotaUsed,
  quotaTotal,
  onLaunchSearch
}) => {
  const { t } = useI18n();
  const quotaRemaining = quotaTotal - quotaUsed;
  const hasQuota = quotaRemaining > 0;
  
  if (!isReady) {
    return null;
  }
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex justify-between items-center">
      <div>
        <div className="text-green-700 font-medium">{t('fast_search_bar.title', 'Ready to Search')}</div>
        <div className="text-sm text-green-600">
          {t('fast_search_bar.description', "You've validated solutions and can now proceed with the Fast Search.")}
          {hasQuota ? (
            <div className="text-xs mt-1">
              {t('fast_search_bar.quota.info_used', 'Search quota: {quotaUsed} of {quotaTotal} used', { quotaUsed, quotaTotal })} {t('fast_search_bar.quota.info_remaining', '({quotaRemaining} remaining)', { quotaRemaining })}
            </div>
          ) : (
            <div className="text-xs mt-1 text-amber-600 font-medium">
              {t('fast_search_bar.quota.warning_exhausted', 'Warning: You have used all your Fast Search quota')}
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={onLaunchSearch}
        disabled={!hasQuota}
        className={`px-4 py-2 rounded-md text-white ${
          hasQuota 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {t('fast_search_bar.button.launch', 'Launch Fast Search')}
      </button>
    </div>
  );
};

export default FastSearchBar;
