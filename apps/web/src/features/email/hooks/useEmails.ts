import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import type { Email } from '@brokerflow/shared';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface SendEmailPayload {
  to_addresses: string[];
  cc_addresses: string[];
  subject: string;
  body_text: string;
  client_id?: string;
  submission_id?: string;
  template_id?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export function useEmails() {
  const items = useAppStore((s) => s.emails.items);
  const isLoading = useAppStore((s) => s.emails.isLoading);
  const error = useAppStore((s) => s.emails.error);
  const setEmails = useAppStore((s) => s.emails.setEmails);
  const setLoading = useAppStore((s) => s.emails.setEmailLoading);
  const setError = useAppStore((s) => s.emails.setEmailError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchEmails = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/emails', { params });
        setEmails(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load emails');
      }
    },
    [setEmails, setLoading, setError],
  );

  const fetchThread = useCallback(
    async (threadId: string): Promise<Email[]> => {
      const response = await apiClient.get(`/emails/threads/${threadId}`);
      return response.data.data ?? [];
    },
    [],
  );

  const sendEmail = useCallback(
    async (payload: SendEmailPayload): Promise<Email> => {
      const response = await apiClient.post('/emails', payload);
      await fetchEmails();
      return response.data.data;
    },
    [fetchEmails],
  );

  const fetchTemplates = useCallback(async (): Promise<EmailTemplate[]> => {
    try {
      const response = await apiClient.get('/templates', {
        params: { type: 'email' },
      });
      return response.data.data ?? [];
    } catch {
      return [];
    }
  }, []);

  const deleteEmail = useCallback(
    async (id: string) => {
      await apiClient.delete(`/emails/${id}`);
      await fetchEmails();
    },
    [fetchEmails],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchEmails,
    fetchThread,
    sendEmail,
    fetchTemplates,
    deleteEmail,
  };
}
