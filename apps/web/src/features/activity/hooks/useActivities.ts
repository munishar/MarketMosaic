import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useActivities() {
  const items = useAppStore((s) => s.activities.items);
  const isLoading = useAppStore((s) => s.activities.isLoading);
  const error = useAppStore((s) => s.activities.error);
  const setActivities = useAppStore((s) => s.activities.setActivities);
  const setLoading = useAppStore((s) => s.activities.setActivityLoading);
  const setError = useAppStore((s) => s.activities.setActivityError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchActivities = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/activities', { params });
        setActivities(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      }
    },
    [setActivities, setLoading, setError],
  );

  const loadMore = useCallback(
    async (page: number, params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/activities', {
          params: { ...params, page },
        });
        setActivities([...items, ...response.data.data]);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      }
    },
    [items, setActivities, setLoading, setError],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchActivities,
    loadMore,
  };
}
