import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Info, AlertTriangle, XCircle, 
  Bell, CheckCheck, Sparkles, Zap, Search,
  FileText, TrendingUp
} from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import type { Notification } from '../../hooks/useNotifications';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
    dotColor: 'bg-green-500'
  },
  info: {
    icon: Info,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    dotColor: 'bg-blue-500'
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
    dotColor: 'bg-amber-500'
  },
  error: {
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-600',
    dotColor: 'bg-red-500'
  }
};

function getContextIcon(notification: Notification) {
  const meta = notification.metadata || {};
  if (meta.context === 'fast_search') return Zap;
  if (meta.context === 'deep_search') return Search;
  if (meta.context === 'solution') return Sparkles;
  if (meta.context === 'brief') return FileText;
  if (meta.context === 'quota') return TrendingUp;
  return null;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      onClose();
      navigate(notification.action_url);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-indigo-600 font-medium">
                {t('notifications.unread_count', '{count} new', { count: unreadCount })}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-all duration-200"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t('notifications.mark_all_read', 'Mark all read')}
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {t('notifications.empty', 'No notifications yet')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('notifications.empty_hint', 'We\'ll notify you when something happens!')}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.notification_type] || TYPE_CONFIG.info;
            const TypeIcon = config.icon;
            const ContextIcon = getContextIcon(notification);
            const isMilestone = notification.metadata?.is_milestone;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-indigo-50/30' : ''
                } ${isMilestone ? 'bg-gradient-to-r from-amber-50/50 to-yellow-50/50 hover:from-amber-50 hover:to-yellow-50' : ''}`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200`}>
                    <TypeIcon className="h-5 w-5" />
                    {isMilestone && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                        <Sparkles className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {ContextIcon && (
                            <ContextIcon className={`h-3.5 w-3.5 ${config.textColor} flex-shrink-0`} />
                          )}
                          <p className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.is_read && (
                        <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${config.dotColor} animate-pulse shadow-sm mt-1`} />
                      )}
                    </div>

                    {/* Timestamp + action hint */}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(notification.created_at)}
                      </span>
                      {notification.action_url && (
                        <span className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {t('notifications.view', 'View')} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestone celebration bar */}
                {isMilestone && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {t('notifications.footer', 'Showing latest {count} notifications', { count: notifications.length })}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
