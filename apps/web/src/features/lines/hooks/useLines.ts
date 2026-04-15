import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useLines() {
  const items = useAppStore((s) => s.lobs.items);
  const isLoading = useAppStore((s) => s.lobs.isLoading);
  const error = useAppStore((s) => s.lobs.error);
  const setLOBs = useAppStore((s) => s.lobs.setLOBs);
  const setLoading = useAppStore((s) => s.lobs.setLOBLoading);
  const setError = useAppStore((s) => s.lobs.setLOBError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchLines = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/lines-of-business', { params });
        setLOBs(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load lines of business',
        );
      }
    },
    [setLOBs, setLoading, setError],
  );

  const createLine = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/lines-of-business', data);
      await fetchLines();
      return response.data.data;
    },
    [fetchLines],
  );

  const updateLine = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/lines-of-business/${id}`, data);
      await fetchLines();
      return response.data.data;
    },
    [fetchLines],
  );

  const deleteLine = useCallback(
    async (id: string) => {
      await apiClient.delete(`/lines-of-business/${id}`);
      await fetchLines();
    },
    [fetchLines],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchLines,
    createLine,
    updateLine,
    deleteLine,
  };
}
