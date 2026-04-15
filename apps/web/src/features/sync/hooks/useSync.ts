import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import type { DataFreshnessScore } from '@brokerflow/shared';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useSync() {
  const schedules = useAppStore((s) => s.sync.schedules);
  const jobs = useAppStore((s) => s.sync.jobs);
  const connections = useAppStore((s) => s.sync.connections);
  const isLoading = useAppStore((s) => s.sync.isLoading);
  const error = useAppStore((s) => s.sync.error);
  const setSchedules = useAppStore((s) => s.sync.setSyncSchedules);
  const setJobs = useAppStore((s) => s.sync.setSyncJobs);
  const setConnections = useAppStore((s) => s.sync.setAMSConnections);
  const setLoading = useAppStore((s) => s.sync.setSyncLoading);
  const setError = useAppStore((s) => s.sync.setSyncError);

  const [freshnessScores, setFreshnessScores] = useState<DataFreshnessScore[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchSchedules = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/sync/schedules', { params });
        setSchedules(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    },
    [setSchedules, setLoading, setError],
  );

  const fetchJobs = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/sync/jobs', { params });
        setJobs(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    },
    [setJobs, setLoading, setError],
  );

  const fetchConnections = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/sync/connections', { params });
        setConnections(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    },
    [setConnections, setLoading, setError],
  );

  const fetchFreshness = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/sync/freshness', { params });
        setFreshnessScores(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load freshness scores');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const createSchedule = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/sync/schedules', data);
      await fetchSchedules();
      return response.data.data;
    },
    [fetchSchedules],
  );

  const updateSchedule = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.patch(`/sync/schedules/${id}`, data);
      await fetchSchedules();
      return response.data.data;
    },
    [fetchSchedules],
  );

  const testConnection = useCallback(async (id: string) => {
    const response = await apiClient.post(`/sync/connections/${id}/test`);
    return response.data.data;
  }, []);

  const triggerManualSync = useCallback(
    async (scheduleId: string) => {
      const response = await apiClient.post(`/sync/schedules/${scheduleId}/trigger`);
      await fetchJobs();
      return response.data.data;
    },
    [fetchJobs],
  );

  const refreshEntity = useCallback(
    async (entityType: string, entityId: string) => {
      const response = await apiClient.post('/sync/freshness/refresh', {
        entity_type: entityType,
        entity_id: entityId,
      });
      await fetchFreshness();
      return response.data.data;
    },
    [fetchFreshness],
  );

  return {
    schedules,
    jobs,
    connections,
    freshnessScores,
    isLoading,
    error,
    meta,
    fetchSchedules,
    fetchJobs,
    fetchConnections,
    fetchFreshness,
    createSchedule,
    updateSchedule,
    testConnection,
    triggerManualSync,
    refreshEntity,
  };
}
