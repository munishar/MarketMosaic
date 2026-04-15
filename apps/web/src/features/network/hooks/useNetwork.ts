import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';

export interface NetworkNode {
  id: string;
  label: string;
  type: 'user' | 'contact';
  carrier?: string;
  region?: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  strength: string;
  deals_placed: number;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface PathResult {
  path: NetworkNode[];
  edges: NetworkEdge[];
}

export function useNetwork() {
  const setRelationships = useAppStore((s) => s.network.setNetworkRelationships);
  const setLoading = useAppStore((s) => s.network.setNetworkLoading);
  const setError = useAppStore((s) => s.network.setNetworkError);
  const isLoading = useAppStore((s) => s.network.isLoading);
  const error = useAppStore((s) => s.network.error);

  const [graphData, setGraphData] = useState<NetworkGraphData>({
    nodes: [],
    edges: [],
  });
  const [searchResults, setSearchResults] = useState<NetworkNode[]>([]);
  const [pathResult, setPathResult] = useState<PathResult | null>(null);

  const fetchGraph = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ data: NetworkGraphData }>(
          '/network',
          { params },
        );
        setGraphData(response.data.data);
        setRelationships([]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load network',
        );
      }
    },
    [setRelationships, setLoading, setError],
  );

  const searchContacts = useCallback(
    async (query: string) => {
      try {
        const response = await apiClient.get<{ data: NetworkNode[] }>(
          '/network/search',
          { params: { q: query } },
        );
        setSearchResults(response.data.data);
        return response.data.data;
      } catch {
        setSearchResults([]);
        return [];
      }
    },
    [],
  );

  const findPath = useCallback(
    async (fromId: string, toId: string) => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ data: PathResult }>(
          '/network/search',
          { params: { from: fromId, to: toId } },
        );
        setPathResult(response.data.data);
        return response.data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to find path');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const createRelationship = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/network/relationships', data);
      await fetchGraph();
      return response.data.data;
    },
    [fetchGraph],
  );

  const updateRelationship = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(
        `/network/relationships/${id}`,
        data,
      );
      await fetchGraph();
      return response.data.data;
    },
    [fetchGraph],
  );

  const requestIntroduction = useCallback(
    async (colleagueId: string, contactId: string, message?: string) => {
      const response = await apiClient.post('/network/introductions', {
        colleague_id: colleagueId,
        contact_id: contactId,
        message,
      });
      return response.data.data;
    },
    [],
  );

  return {
    graphData,
    searchResults,
    pathResult,
    isLoading,
    error,
    fetchGraph,
    searchContacts,
    findPath,
    createRelationship,
    updateRelationship,
    requestIntroduction,
  };
}
