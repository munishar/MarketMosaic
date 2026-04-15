import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { FormPaper } from '@brokerflow/shared';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useForms() {
  const [items, setItems] = useState<FormPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 25, total: 0, total_pages: 1 });

  const fetchForms = useCallback(async (params?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/forms', { params });
      setItems(response.data.data);
      if (response.data.meta) setMeta(response.data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createForm = useCallback(async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/forms', data);
    await fetchForms();
    return response.data.data;
  }, [fetchForms]);

  const updateForm = useCallback(async (id: string, data: Record<string, unknown>) => {
    const response = await apiClient.put(`/forms/${id}`, data);
    await fetchForms();
    return response.data.data;
  }, [fetchForms]);

  return { items, isLoading, error, meta, fetchForms, createForm, updateForm };
}
