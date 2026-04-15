import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Dialog } from '@/components/ui/Dialog';
import { SubmissionBuilder } from './SubmissionBuilder';
import { SubmissionDetail } from './SubmissionDetail';
import { useSubmissions } from './hooks/useSubmissions';
import {
  SubmissionStatus,
  SubmissionPriority,
  type Submission,
} from '@marketmosaic/shared';
import { formatDate } from '@/lib/utils';

const statusFilterOptions = Object.values(SubmissionStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const priorityFilterOptions = Object.values(SubmissionPriority).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', options: statusFilterOptions },
  { key: 'priority', label: 'Priority', options: priorityFilterOptions },
];

const SubmissionManager: React.FC = () => {
  const { items, isLoading, meta, fetchSubmissions } = useSubmissions();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const fetchParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort: sortField,
      order: sortOrder,
      search: search || undefined,
      ...Object.fromEntries(
        Object.entries(filterValues).filter(([, v]) => v !== ''),
      ),
    }),
    [page, sortField, sortOrder, search, filterValues],
  );

  useEffect(() => {
    void fetchSubmissions(fetchParams);
  }, [fetchSubmissions, fetchParams]);

  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField],
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilterValues({});
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCreate = useCallback(() => {
    setShowBuilder(true);
  }, []);

  const handleRowClick = useCallback((row: Submission) => {
    setSelectedSubmission(row);
  }, []);

  const handleBuilderComplete = useCallback(() => {
    setShowBuilder(false);
  }, []);

  const columns: Column<Submission>[] = useMemo(
    () => [
      { key: 'client_id', header: 'Client', sortable: true },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'effective_date',
        header: 'Effective',
        sortable: true,
        render: (value) => formatDate(value as string),
      },
      {
        key: 'expiration_date',
        header: 'Expiration',
        sortable: true,
        render: (value) => formatDate(value as string),
      },
      {
        key: 'lines_requested',
        header: 'Lines',
        render: (value) => {
          const lines = value as Submission['lines_requested'];
          return (
            <span className="text-sm text-gray-600">
              {Array.isArray(lines) ? lines.length : 0}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        render: (value) => formatDate(value as string),
      },
    ],
    [],
  );

  if (selectedSubmission) {
    return (
      <div>
        <PageHeader
          title={`Submission — ${selectedSubmission.client_id}`}
          description={`Status: ${selectedSubmission.status}`}
        />
        <button
          onClick={() => setSelectedSubmission(null)}
          className="mb-4 text-sm text-[#2E75B6] hover:underline"
        >
          ← Back to Submissions
        </button>
        <SubmissionDetail submission={selectedSubmission} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Create and manage submission packages to carriers."
        action={{
          label: 'New Submission',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search submissions..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<Submission>
        columns={columns}
        data={items as Submission[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No submissions found. Create your first submission to get started."
        rowKey={(row) => row.id}
      />

      <Dialog
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        title="New Submission"
        size="xl"
      >
        <SubmissionBuilder
          onComplete={handleBuilderComplete}
          onCancel={() => setShowBuilder(false)}
        />
      </Dialog>
    </div>
  );
};

export default SubmissionManager;
