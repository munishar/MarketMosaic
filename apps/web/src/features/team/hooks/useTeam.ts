import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User, Team } from '@brokerflow/shared';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function useTeam() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
  });

  const fetchUsers = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/users', { params });
        setUsers(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchTeams = useCallback(async () => {
    try {
      const response = await apiClient.get('/teams');
      setTeams(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    }
  }, []);

  const createUser = useCallback(
    async (data: Record<string, unknown>) => {
      const response = await apiClient.post('/users', data);
      await fetchUsers();
      return response.data.data;
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const response = await apiClient.put(`/users/${id}`, data);
      await fetchUsers();
      return response.data.data;
    },
    [fetchUsers],
  );

  return {
    users,
    teams,
    isLoading,
    error,
    meta,
    fetchUsers,
    fetchTeams,
    createUser,
    updateUser,
  };
}
