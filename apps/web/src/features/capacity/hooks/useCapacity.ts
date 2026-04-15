import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useCapacity() {
  const items = useAppStore((s) => s.capacities.items);
  const isLoading = useAppStore((s) => s.capacities.isLoading);
  const error = useAppStore((s) => s.capacities.error);
  const setCapacities = useAppStore((s) => s.capacities.setCapacities);
  const setLoading = useAppStore((s) => s.capacities.setCapacityLoading);
  const setError = useAppStore((s) => s.capacities.setCapacityError);

  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 25, total: 0, total_pages: 1 });

  const fetchCapacities = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/capacities', { params });
      setCapacities(response.data.data);
      if (response.data.meta) setMeta(response.data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load capacity data');
    }
  }, [setCapacities, setLoading, setError]);

  const createCapacity = useCallback(async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/capacities', data);
    await fetchCapacities();
    return response.data.data;
  }, [fetchCapacities]);

  const updateCapacity = useCallback(async (id: string, data: Record<string, unknown>) => {
    const response = await apiClient.put(`/capacities/${id}`, data);
    await fetchCapacities();
    return response.data.data;
  }, [fetchCapacities]);

  return { items, isLoading, error, meta, fetchCapacities, createCapacity, updateCapacity };
}
