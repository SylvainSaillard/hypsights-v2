import { useState, useEffect, useCallback, useRef } from 'react';
import { executeEdgeAction } from '../lib/edgeActionHelper';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await executeEdgeAction('notifications', 'list_notifications', {
        limit: 20
      });
      const notifs = result?.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await executeEdgeAction('notifications', 'get_unread_count');
      if (result?.unread_count !== undefined) {
        setUnreadCount(result.unread_count);
      }
    } catch (err: any) {
      // Silent fail for polling — don't update error state
      console.error('Failed to poll unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await executeEdgeAction('notifications', 'mark_as_read', {
        notification_id: id
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await executeEdgeAction('notifications', 'mark_all_as_read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll unread count every 30s
  useEffect(() => {
    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}

export default useNotifications;
