import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useSubmissions() {
  const items = useAppStore((s) => s.submissions.items);
  const isLoading = useAppStore((s) => s.submissions.isLoading);
  const error = useAppStore((s) => s.submissions.error);
  const setSubmissions = useAppStore((s) => s.submissions.setSubmissions);
  const setLoading = useAppStore((s) => s.submissions.setSubmissionLoading);
  const setError = useAppStore((s) => s.submissions.setSubmissionError);

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchSubmissions = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/submissions', { params });
        setSubmissions(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load submissions',
        );
      }
    },
    [setSubmissions, setLoading, setError],
  );

  const createSubmission = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/submissions', data);
      await fetchSubmissions();
      return response.data.data;
    },
    [fetchSubmissions],
  );

  const updateSubmission = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/submissions/${id}`, data);
      await fetchSubmissions();
      return response.data.data;
    },
    [fetchSubmissions],
  );

  const deleteSubmission = useCallback(
    async (id: string) => {
      await apiClient.delete(`/submissions/${id}`);
      await fetchSubmissions();
    },
    [fetchSubmissions],
  );

  const fetchTargets = useCallback(async (submissionId: string) => {
    const response = await apiClient.get(
      `/submissions/${submissionId}/targets`,
    );
    return response.data.data;
  }, []);

  const matchUnderwriters = useCallback(
    async (clientId: string, lobId: string, limit: number) => {
      const response = await apiClient.post('/match/underwriters', {
        client_id: clientId,
        line_of_business_id: lobId,
        requested_limit: limit,
      });
      return response.data.data;
    },
    [],
  );

  return {
    items,
    isLoading,
    error,
    meta,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    fetchTargets,
    matchUnderwriters,
  };
}
