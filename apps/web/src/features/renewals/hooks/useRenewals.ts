import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Submission } from '@brokerflow/shared';

interface RenewalFilters {
  status?: string;
  months?: number;
}

export function useRenewals() {
  const [items, setItems] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRenewals = useCallback(
    async (filters?: RenewalFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/submissions', {
          params: {
            limit: 100,
            sort: 'expiration_date',
            order: 'asc',
            ...filters,
          },
        });
        const submissions: Submission[] = response.data.data ?? [];

        // Filter to actual renewals or submissions nearing expiration
        const now = new Date();
        const monthsAhead = filters?.months ?? 6;
        const cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() + monthsAhead);

        const renewals = submissions.filter(
          (s) =>
            s.renewal_of !== null ||
            (s.is_active &&
              new Date(s.expiration_date) <= cutoff),
        );

        setItems(renewals);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load renewals',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { items, isLoading, error, fetchRenewals };
}
