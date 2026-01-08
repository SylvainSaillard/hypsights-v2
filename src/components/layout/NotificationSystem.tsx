import React, { useState, useRef } from 'react';
import { useI18n } from '../../contexts/I18nContext';

/**
 * Notification System Component
 * Currently disabled as the service is not yet implemented.
 * Displays a grayed out bell icon with a "Coming Soon" tooltip.
 */
const NotificationSystem: React.FC = () => {
  const { t } = useI18n();
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  return (
    <div className="relative flex items-center">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative p-2 text-gray-400 cursor-not-allowed transition-colors"
        aria-label="Notifications (Coming Soon)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 grayscale opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>

      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-800 text-white text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap">
            {t('notifications.coming_soon', 'Notifications arriving soon')}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
