import { useCallback, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

const POLLING_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const items = useAppStore((s) => s.notifications.items);
  const unreadCount = useAppStore((s) => s.notifications.unreadCount);
  const isLoading = useAppStore((s) => s.notifications.isLoading);
  const error = useAppStore((s) => s.notifications.error);
  const setNotifications = useAppStore((s) => s.notifications.setNotifications);
  const setLoading = useAppStore((s) => s.notifications.setNotificationLoading);
  const setError = useAppStore((s) => s.notifications.setNotificationError);
  const storeMarkAsRead = useAppStore((s) => s.notifications.markAsRead);
  const storeMarkAllAsRead = useAppStore((s) => s.notifications.markAllAsRead);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/notifications', { params });
        setNotifications(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      }
    },
    [setNotifications, setLoading, setError],
  );

  const markRead = useCallback(
    async (id: string) => {
      storeMarkAsRead(id);
      try {
        await apiClient.patch(`/notifications/${id}/read`);
      } catch {
        // Optimistic update; refetch on failure
        await fetchNotifications();
      }
    },
    [storeMarkAsRead, fetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    storeMarkAllAsRead();
    try {
      await apiClient.patch('/notifications/read-all');
    } catch {
      await fetchNotifications();
    }
  }, [storeMarkAllAsRead, fetchNotifications]);

  // Start polling on mount
  useEffect(() => {
    fetchNotifications();

    pollingRef.current = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchNotifications]);

  return {
    items,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
  };
}
