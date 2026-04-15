import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useCarriers() {
  const items = useAppStore((s) => s.carriers.items);
  const isLoading = useAppStore((s) => s.carriers.isLoading);
  const error = useAppStore((s) => s.carriers.error);
  const setCarriers = useAppStore((s) => s.carriers.setCarriers);
  const setLoading = useAppStore((s) => s.carriers.setCarrierLoading);
  const setError = useAppStore((s) => s.carriers.setCarrierError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchCarriers = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/carriers', { params });
        setCarriers(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load carriers');
      }
    },
    [setCarriers, setLoading, setError],
  );

  const createCarrier = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/carriers', data);
      await fetchCarriers();
      return response.data.data;
    },
    [fetchCarriers],
  );

  const updateCarrier = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/carriers/${id}`, data);
      await fetchCarriers();
      return response.data.data;
    },
    [fetchCarriers],
  );

  const deleteCarrier = useCallback(
    async (id: string) => {
      await apiClient.delete(`/carriers/${id}`);
      await fetchCarriers();
    },
    [fetchCarriers],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchCarriers,
    createCarrier,
    updateCarrier,
    deleteCarrier,
  };
}
