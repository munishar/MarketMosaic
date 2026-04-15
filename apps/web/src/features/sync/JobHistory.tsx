import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { SyncJobStatus, SyncJobType } from '@brokerflow/shared';
import type { SyncJob } from '@brokerflow/shared';

const statusFilterOptions = Object.values(SyncJobStatus).map((v) => ({
  value: v,
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const jobTypeFilterOptions = Object.values(SyncJobType).map((v) => ({
  value: v,
  label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const filterDefs: FilterDef[] = [
  { key: 'status', label: 'Status', options: statusFilterOptions },
  { key: 'job_type', label: 'Job Type', options: jobTypeFilterOptions },
];

interface JobHistoryProps {
  jobs: SyncJob[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const JobHistory: React.FC<JobHistoryProps> = ({
  jobs,
  isLoading,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: '',
    job_type: '',
  });

  const filteredJobs = jobs.filter((job) => {
    if (filterValues.status && job.status !== filterValues.status) return false;
    if (filterValues.job_type && job.job_type !== filterValues.job_type) return false;
    return true;
  });

  const columns: Column<SyncJob>[] = [
    {
      key: 'id',
      header: '',
      className: 'w-8',
      render: (_value, row) => {
        const hasErrors = row.error_log && row.error_log.length > 0;
        if (!hasErrors) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedId(expandedId === row.id ? null : row.id);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            {expandedId === row.id ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
    {
      key: 'job_type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={String(value)} />,
    },
    {
      key: 'started_at',
      header: 'Started',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'completed_at',
      header: 'Completed',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'records_processed',
      header: 'Processed',
      render: (value) => (
        <span className="font-mono text-sm">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'records_updated',
      header: 'Updated',
      render: (value) => (
        <span className="font-mono text-sm text-green-600">
          {Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'records_failed',
      header: 'Failed',
      render: (value) => {
        const count = Number(value);
        return (
          <span className={`font-mono text-sm ${count > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {count.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterDefs}
        values={filterValues}
        onChange={(key, value) =>
          setFilterValues((prev) => ({ ...prev, [key]: value }))
        }
        onClear={() => setFilterValues({ status: '', job_type: '' })}
      />

      <DataTable<SyncJob>
        columns={columns}
        data={filteredJobs}
        isLoading={isLoading}
        rowKey={(row) => row.id}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        emptyMessage="No sync jobs found"
      />

      {/* Expanded error details */}
      {expandedId && (() => {
        const job = jobs.find((j) => j.id === expandedId);
        if (!job || !job.error_log || job.error_log.length === 0) return null;
        return (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-semibold text-red-800">
                Error Log — {job.job_type}
              </h4>
            </div>
            <div className="space-y-2">
              {job.error_log.map((entry, i) => (
                <pre
                  key={i}
                  className="rounded bg-red-100 p-2 text-xs font-mono text-red-700 overflow-x-auto"
                >
                  {JSON.stringify(entry, null, 2)}
                </pre>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
