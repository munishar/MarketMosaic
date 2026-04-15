import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { CapacityForm } from './CapacityForm';
import { CapacitySearch } from './CapacitySearch';
import { useCapacity } from './hooks/useCapacity';
import { useAppStore } from '@/store';
import type { UnderwriterCapacity, Contact, Carrier, LineOfBusiness } from '@brokerflow/shared';

function getCapacityColor(deployed: string | null, available: string | null): 'success' | 'warning' | 'danger' | 'default' {
  if (!deployed || !available) return 'default';
  const dep = parseFloat(deployed.replace(/[^0-9.]/g, '')) || 0;
  const avail = parseFloat(available.replace(/[^0-9.]/g, '')) || 0;
  const total = dep + avail;
  if (total === 0) return 'default';
  const pctAvail = avail / total;
  if (pctAvail > 0.5) return 'success';
  if (pctAvail >= 0.2) return 'warning';
  return 'danger';
}

const CapacityMatrix: React.FC = () => {
  const { items, isLoading, meta, fetchCapacities, createCapacity, updateCapacity } = useCapacity();
  const contacts = useAppStore((s) => s.contacts.items) as Contact[];
  const carriers = useAppStore((s) => s.carriers.items) as Carrier[];
  const lines = useAppStore((s) => s.lobs.items) as LineOfBusiness[];

  const [sortField, setSortField] = useState('carrier_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<UnderwriterCapacity | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchParams = useMemo(() => ({
    page, limit: 25, sort: sortField, order: sortOrder,
    ...Object.fromEntries(Object.entries(searchFilters).filter(([, v]) => v !== '')),
  }), [page, sortField, sortOrder, searchFilters]);

  useEffect(() => { void fetchCapacities(fetchParams); }, [fetchCapacities, fetchParams]);

  const handleSort = useCallback((field: string) => {
    if (field === sortField) setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  }, [sortField]);

  const handleSearch = useCallback((filters: Record<string, string>) => {
    setSearchFilters(filters);
    setPage(1);
  }, []);

  const handleFormSubmit = useCallback(async (values: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingCapacity) await updateCapacity(editingCapacity.id, values);
      else await createCapacity(values);
      setShowFormDialog(false);
      setEditingCapacity(null);
    } finally { setFormLoading(false); }
  }, [editingCapacity, createCapacity, updateCapacity]);

  const contactMap = useMemo(() => new Map(contacts.map((c) => [c.id, `${c.first_name} ${c.last_name}`])), [contacts]);
  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c.name])), [carriers]);
  const lobMap = useMemo(() => new Map(lines.map((l) => [l.id, l.name])), [lines]);

  const columns: Column<UnderwriterCapacity>[] = useMemo(() => [
    { key: 'contact_id', header: 'Contact', sortable: true, render: (v) => contactMap.get(v as string) ?? '—' },
    { key: 'carrier_id', header: 'Carrier', sortable: true, render: (v) => carrierMap.get(v as string) ?? '—' },
    { key: 'line_of_business_id', header: 'Line', sortable: true, render: (v) => lobMap.get(v as string) ?? '—' },
    { key: 'min_limit', header: 'Min Limit' },
    { key: 'max_limit', header: 'Max Limit' },
    {
      key: 'available_capacity', header: 'Available',
      render: (value, row) => {
        const color = getCapacityColor(row.deployed_capacity as string | null, value as string | null);
        return value ? <Badge variant={color}>{value as string}</Badge> : '—';
      },
    },
    {
      key: 'appetite_states', header: 'States',
      render: (value) => {
        const states = value as string[] | undefined;
        if (!states || states.length === 0) return '—';
        const display = states.length > 3 ? [...states.slice(0, 3), `+${states.length - 3}`] : states;
        return <div className="flex flex-wrap gap-1">{display.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>;
      },
    },
  ], [contactMap, carrierMap, lobMap]);

  return (
    <div>
      <PageHeader title="Capacity Matrix" description="Underwriter capacity across carriers and lines of business."
        action={{ label: 'New Capacity', onClick: () => { setEditingCapacity(null); setShowFormDialog(true); }, icon: <Plus className="h-4 w-4" /> }} />

      <CapacitySearch carriers={carriers} lines={lines as LineOfBusiness[]} onSearch={handleSearch} />

      <DataTable<UnderwriterCapacity>
        columns={columns} data={items as UnderwriterCapacity[]} isLoading={isLoading}
        onRowClick={(row) => { setEditingCapacity(row); setShowFormDialog(true); }}
        page={meta.page} totalPages={meta.total_pages} onPageChange={setPage}
        sortField={sortField} sortOrder={sortOrder} onSort={handleSort}
        emptyMessage="No capacity records found." rowKey={(row) => row.id} />

      <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} title={editingCapacity ? 'Edit Capacity' : 'New Capacity'} size="xl">
        <CapacityForm initialValues={editingCapacity ?? undefined} contacts={contacts} carriers={carriers} lines={lines as LineOfBusiness[]}
          onSubmit={handleFormSubmit} onCancel={() => setShowFormDialog(false)} isLoading={formLoading} />
      </Dialog>
    </div>
  );
};

export default CapacityMatrix;
