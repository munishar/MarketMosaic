import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Dialog } from '@/components/ui/Dialog';
import { ClientForm } from './ClientForm';
import { ClientDetail } from './ClientDetail';
import { useClients } from './hooks/useClients';
import { ClientStatus, type Client } from '@marketmosaic/shared';

const statusFilterOptions = Object.values(ClientStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', options: statusFilterOptions },
];

const ClientManager: React.FC = () => {
  const { items, isLoading, meta, fetchClients, createClient, updateClient } =
    useClients();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
    void fetchClients(fetchParams);
  }, [fetchClients, fetchParams]);

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
    setEditingClient(null);
    setShowFormDialog(true);
  }, []);

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setShowFormDialog(true);
    setSelectedClient(null);
  }, []);

  const handleRowClick = useCallback((row: Client) => {
    setSelectedClient(row);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true);
      try {
        if (editingClient) {
          await updateClient(editingClient.id, values);
        } else {
          await createClient(values);
        }
        setShowFormDialog(false);
        setEditingClient(null);
      } finally {
        setFormLoading(false);
      }
    },
    [editingClient, createClient, updateClient],
  );

  const columns: Column<Client>[] = useMemo(
    () => [
      { key: 'company_name', header: 'Company', sortable: true },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      { key: 'industry', header: 'Industry', sortable: true },
      { key: 'primary_contact_name', header: 'Primary Contact' },
      { key: 'primary_contact_email', header: 'Email' },
    ],
    [],
  );

  if (selectedClient) {
    return (
      <div>
        <PageHeader
          title={selectedClient.company_name}
          description={selectedClient.dba || undefined}
          action={{
            label: 'Edit Client',
            onClick: () => handleEdit(selectedClient),
          }}
        />
        <button
          onClick={() => setSelectedClient(null)}
          className="mb-4 text-sm text-secondary hover:underline"
        >
          ← Back to Clients
        </button>
        <ClientDetail client={selectedClient} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client accounts and insured businesses."
        action={{
          label: 'New Client',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search clients..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<Client>
        columns={columns}
        data={items as Client[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No clients found. Create your first client to get started."
        rowKey={(row) => row.id}
      />

      <Dialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        title={editingClient ? 'Edit Client' : 'New Client'}
        size="lg"
      >
        <ClientForm
          initialValues={editingClient ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormDialog(false)}
          isLoading={formLoading}
        />
      </Dialog>
    </div>
  );
};

export default ClientManager;
