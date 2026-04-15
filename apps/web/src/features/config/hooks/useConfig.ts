import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import type { PlatformManifest } from '@marketmosaic/shared';

interface ManifestHistoryEntry {
  id: string;
  version: number;
  config: Record<string, unknown>;
  change_notes: string | null;
  created_by: string;
  created_at: string;
}

export function useConfig() {
  const manifests = useAppStore((s) => s.config.manifests);
  const isLoading = useAppStore((s) => s.config.isLoading);
  const error = useAppStore((s) => s.config.error);
  const setManifests = useAppStore((s) => s.config.setManifests);
  const setLoading = useAppStore((s) => s.config.setConfigLoading);
  const setError = useAppStore((s) => s.config.setConfigError);

  const [currentManifest, setCurrentManifest] = useState<PlatformManifest | null>(null);
  const [history, setHistory] = useState<ManifestHistoryEntry[]>([]);

  const fetchManifests = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get('/config/manifests', { params });
        setManifests(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load manifests');
      }
    },
    [setManifests, setLoading, setError],
  );

  const getManifest = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/config/manifests/${id}`);
        const manifest = response.data.data as PlatformManifest;
        setCurrentManifest(manifest);
        return manifest;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load manifest');
        return null;
      }
    },
    [setLoading, setError],
  );

  const updateManifest = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.patch(`/config/manifests/${id}`, data);
      await fetchManifests();
      return response.data.data;
    },
    [fetchManifests],
  );

  const createManifest = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/config/manifests', data);
      await fetchManifests();
      return response.data.data;
    },
    [fetchManifests],
  );

  const getManifestHistory = useCallback(
    async (id: string) => {
      try {
        const response = await apiClient.get(`/config/manifests/${id}/history`);
        const entries = response.data.data as ManifestHistoryEntry[];
        setHistory(entries);
        return entries;
      } catch {
        return [];
      }
    },
    [],
  );

  return {
    manifests,
    currentManifest,
    history,
    isLoading,
    error,
    fetchManifests,
    getManifest,
    updateManifest,
    createManifest,
    getManifestHistory,
  };
}
