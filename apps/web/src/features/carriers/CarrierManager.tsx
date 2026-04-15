import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { CarrierForm } from './CarrierForm';
import { CarrierDetail } from './CarrierDetail';
import { useCarriers } from './hooks/useCarriers';
import { CarrierType, type Carrier } from '@brokerflow/shared';

const carrierTypeOptions = Object.values(CarrierType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const appointedOptions = [
  { value: 'true', label: 'Appointed' },
  { value: 'false', label: 'Not Appointed' },
];

const FILTERS: FilterDef[] = [
  { key: 'type', label: 'Type', options: carrierTypeOptions },
  { key: 'appointed', label: 'Appointed', options: appointedOptions },
];

function getRatingVariant(
  rating: string | null,
): 'success' | 'warning' | 'danger' | 'default' {
  if (!rating) return 'default';
  const upper = rating.toUpperCase();
  if (upper.startsWith('A+') || upper.startsWith('A ') || upper === 'A')
    return 'success';
  if (upper.startsWith('A-') || upper.startsWith('B+')) return 'warning';
  return 'danger';
}

const CarrierManager: React.FC = () => {
  const { items, isLoading, meta, fetchCarriers, createCarrier, updateCarrier } =
    useCarriers();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
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
    void fetchCarriers(fetchParams);
  }, [fetchCarriers, fetchParams]);

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
    setEditingCarrier(null);
    setShowFormDialog(true);
  }, []);

  const handleEdit = useCallback((carrier: Carrier) => {
    setEditingCarrier(carrier);
    setShowFormDialog(true);
    setSelectedCarrier(null);
  }, []);

  const handleRowClick = useCallback((row: Carrier) => {
    setSelectedCarrier(row);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true);
      try {
        if (editingCarrier) {
          await updateCarrier(editingCarrier.id, values);
        } else {
          await createCarrier(values);
        }
        setShowFormDialog(false);
        setEditingCarrier(null);
      } finally {
        setFormLoading(false);
      }
    },
    [editingCarrier, createCarrier, updateCarrier],
  );

  const columns: Column<Carrier>[] = useMemo(
    () => [
      { key: 'name', header: 'Carrier Name', sortable: true },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (value) =>
          (value as string)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
      },
      {
        key: 'am_best_rating',
        header: 'AM Best',
        sortable: true,
        render: (value) =>
          value ? (
            <Badge variant={getRatingVariant(value as string)}>
              {value as string}
            </Badge>
          ) : (
            '—'
          ),
      },
      {
        key: 'appointed',
        header: 'Appointed',
        render: (value) => (
          <Badge variant={value ? 'success' : 'default'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      { key: 'headquarters_state', header: 'HQ State' },
    ],
    [],
  );

  if (selectedCarrier) {
    return (
      <div>
        <PageHeader
          title={selectedCarrier.name}
          description={`${selectedCarrier.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} carrier`}
          action={{
            label: 'Edit Carrier',
            onClick: () => handleEdit(selectedCarrier),
          }}
        />
        <button
          onClick={() => setSelectedCarrier(null)}
          className="mb-4 text-sm text-secondary hover:underline"
        >
          ← Back to Carriers
        </button>
        <CarrierDetail carrier={selectedCarrier} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Carriers"
        description="Carrier directory with AM Best ratings and appointment status."
        action={{
          label: 'New Carrier',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search carriers..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<Carrier>
        columns={columns}
        data={items as Carrier[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No carriers found. Add your first carrier to get started."
        rowKey={(row) => row.id}
      />

      <Dialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        title={editingCarrier ? 'Edit Carrier' : 'New Carrier'}
        size="lg"
      >
        <CarrierForm
          initialValues={editingCarrier ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormDialog(false)}
          isLoading={formLoading}
        />
      </Dialog>
    </div>
  );
};

export default CarrierManager;
