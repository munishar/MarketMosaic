import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { UserProfile } from './UserProfile';
import { useTeam } from './hooks/useTeam';
import { UserRole, type User } from '@brokerflow/shared';

const roleOptions = Object.values(UserRole).map((r) => ({
  value: r,
  label: r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const FILTERS: FilterDef[] = [
  { key: 'role', label: 'Role', options: roleOptions },
];

const TeamManager: React.FC = () => {
  const { users, isLoading, meta, fetchUsers } = useTeam();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    void fetchUsers(fetchParams);
  }, [fetchUsers, fetchParams]);

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

  const handleRowClick = useCallback((row: User) => {
    setSelectedUser(row);
  }, []);

  const columns: Column<User>[] = useMemo(
    () => [
      { key: 'first_name', header: 'First Name', sortable: true },
      { key: 'last_name', header: 'Last Name', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        render: (value) => (
          <Badge variant="primary">
            {(value as string).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        ),
      },
      { key: 'region', header: 'Region', sortable: true },
      {
        key: 'is_active',
        header: 'Status',
        render: (value) => (
          <Badge variant={value ? 'success' : 'danger'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (selectedUser) {
    return (
      <div>
        <PageHeader
          title={`${selectedUser.first_name} ${selectedUser.last_name}`}
          description={selectedUser.role}
        />
        <button
          onClick={() => setSelectedUser(null)}
          className="mb-4 text-sm text-secondary hover:underline"
        >
          ← Back to Team
        </button>
        <UserProfile user={selectedUser} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Team"
        description="View and manage your team members."
        action={{
          label: 'Team Directory',
          onClick: () => {},
          icon: <Users className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search team members..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<User>
        columns={columns}
        data={users as User[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No team members found."
        rowKey={(row) => row.id}
      />
    </div>
  );
};

export default TeamManager;
