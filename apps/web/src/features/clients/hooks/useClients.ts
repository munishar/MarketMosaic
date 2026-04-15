import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useClients() {
  const items = useAppStore((s) => s.clients.items);
  const isLoading = useAppStore((s) => s.clients.isLoading);
  const error = useAppStore((s) => s.clients.error);
  const setClients = useAppStore((s) => s.clients.setClients);
  const setLoading = useAppStore((s) => s.clients.setClientLoading);
  const setError = useAppStore((s) => s.clients.setClientError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchClients = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/clients', { params });
        setClients(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients');
      }
    },
    [setClients, setLoading, setError],
  );

  const createClient = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/clients', data);
      await fetchClients();
      return response.data.data;
    },
    [fetchClients],
  );

  const updateClient = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/clients/${id}`, data);
      await fetchClients();
      return response.data.data;
    },
    [fetchClients],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      await apiClient.delete(`/clients/${id}`);
      await fetchClients();
    },
    [fetchClients],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
