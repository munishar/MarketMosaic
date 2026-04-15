import React, { useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FreshnessBadge } from '@/components/shared/FreshnessBadge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import type { DataFreshnessScore } from '@marketmosaic/shared';

interface FreshnessMonitorProps {
  scores: DataFreshnessScore[];
  isLoading?: boolean;
  onRefresh: (entityType: string, entityId: string) => Promise<void>;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const FreshnessMonitor: React.FC<FreshnessMonitorProps> = ({
  scores,
  isLoading,
  onRefresh,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [refreshingId, setRefreshingId] = React.useState<string | null>(null);

  const handleRefresh = useCallback(
    async (score: DataFreshnessScore) => {
      setRefreshingId(score.id);
      try {
        await onRefresh(score.entity_type, score.entity_id);
      } finally {
        setRefreshingId(null);
      }
    },
    [onRefresh],
  );

  const columns: Column<DataFreshnessScore>[] = [
    {
      key: 'entity_type',
      header: 'Entity Type',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'entity_id',
      header: 'Entity ID',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500">
          {String(value).slice(0, 8)}…
        </span>
      ),
    },
    {
      key: 'freshness_status',
      header: 'Status',
      sortable: true,
      render: (value, row) => (
        <FreshnessBadge status={String(value)} lastVerified={row.last_verified_at} />
      ),
    },
    {
      key: 'freshness_score',
      header: 'Score',
      sortable: true,
      render: (value) => {
        const score = Number(value);
        const color =
          score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{score}%</span>;
      },
    },
    {
      key: 'last_verified_at',
      header: 'Last Verified',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'next_verification_due',
      header: 'Next Due',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value, row) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="h-3 w-3" />}
          onClick={(e) => {
            e.stopPropagation();
            handleRefresh(row);
          }}
          isLoading={refreshingId === row.id}
        >
          Refresh
        </Button>
      ),
    },
  ];

  return (
    <DataTable<DataFreshnessScore>
      columns={columns}
      data={scores}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyMessage="No freshness scores found"
    />
  );
};
