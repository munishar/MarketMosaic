import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { SubmissionTargetStatus } from '@brokerflow/shared';
import type { SubmissionTarget } from '@brokerflow/shared';

interface PlacementGroup {
  status: SubmissionTargetStatus;
  targets: SubmissionTarget[];
}

export function usePlacements() {
  const [groups, setGroups] = useState<PlacementGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlacements = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/submissions/targets', {
          params,
        });
        const targets: SubmissionTarget[] = response.data.data ?? [];

        const statusOrder: SubmissionTargetStatus[] = [
          SubmissionTargetStatus.pending,
          SubmissionTargetStatus.submitted,
          SubmissionTargetStatus.reviewing,
          SubmissionTargetStatus.quoted,
          SubmissionTargetStatus.declined,
          SubmissionTargetStatus.bound,
          SubmissionTargetStatus.expired,
        ];

        const grouped = statusOrder.map((status) => ({
          status,
          targets: targets.filter((t) => t.status === status),
        }));

        setGroups(grouped);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load placements',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateTargetStatus = useCallback(
    async (
      submissionId: string,
      targetId: string,
      data: Record<string, unknown>,
    ) => {
      const response = await apiClient.put(
        `/submissions/${submissionId}/targets/${targetId}`,
        data,
      );
      await fetchPlacements();
      return response.data.data;
    },
    [fetchPlacements],
  );

  return { groups, isLoading, error, fetchPlacements, updateTargetStatus };
}
