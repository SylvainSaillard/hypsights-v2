import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import NotificationPanel from '../notifications/NotificationPanel';

/**
 * Notification System Component
 * Bell icon with animated unread badge and dropdown notification panel.
 */
const NotificationSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh notifications when opening the panel
  const handleToggle = () => {
    if (!isOpen) {
      refresh();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-lg transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'text-indigo-600 bg-indigo-50'
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;
