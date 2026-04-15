import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useContacts() {
  const items = useAppStore((s) => s.contacts.items);
  const isLoading = useAppStore((s) => s.contacts.isLoading);
  const error = useAppStore((s) => s.contacts.error);
  const setContacts = useAppStore((s) => s.contacts.setContacts);
  const setLoading = useAppStore((s) => s.contacts.setContactLoading);
  const setError = useAppStore((s) => s.contacts.setContactError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchContacts = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/contacts', { params });
        setContacts(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      }
    },
    [setContacts, setLoading, setError],
  );

  const createContact = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/contacts', data);
      await fetchContacts();
      return response.data.data;
    },
    [fetchContacts],
  );

  const updateContact = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/contacts/${id}`, data);
      await fetchContacts();
      return response.data.data;
    },
    [fetchContacts],
  );

  const deleteContact = useCallback(
    async (id: string) => {
      await apiClient.delete(`/contacts/${id}`);
      await fetchContacts();
    },
    [fetchContacts],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
