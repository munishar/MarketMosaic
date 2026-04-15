import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { FormForm } from './FormForm';
import { useForms } from './hooks/useForms';
import { useAppStore } from '@/store';
import { FormPaperType, type FormPaper, type Carrier, type LineOfBusiness } from '@brokerflow/shared';

const typeOptions = Object.values(FormPaperType).map((t) => ({
  value: t, label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const FormsPaperRegistry: React.FC = () => {
  const { items, isLoading, meta, fetchForms, createForm, updateForm } = useForms();
  const carriers = useAppStore((s) => s.carriers.items) as Carrier[];
  const lines = useAppStore((s) => s.lobs.items) as LineOfBusiness[];

  const carrierOptions = useMemo(() => carriers.map((c) => ({ value: c.id, label: c.name })), [carriers]);
  const lobOptions = useMemo(() => lines.map((l) => ({ value: l.id, label: l.name })), [lines]);

  const FILTERS: FilterDef[] = useMemo(() => [
    { key: 'type', label: 'Type', options: typeOptions },
    { key: 'carrier_id', label: 'Carrier', options: carrierOptions },
    { key: 'line_of_business_id', label: 'Line', options: lobOptions },
  ], [carrierOptions, lobOptions]);

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingForm, setEditingForm] = useState<FormPaper | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchParams = useMemo(() => ({
    page, limit: 25, sort: sortField, order: sortOrder, search: search || undefined,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v !== '')),
  }), [page, sortField, sortOrder, search, filterValues]);

  useEffect(() => { void fetchForms(fetchParams); }, [fetchForms, fetchParams]);

  const handleSort = useCallback((field: string) => {
    if (field === sortField) setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  }, [sortField]);

  const handleFormSubmit = useCallback(async (values: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingForm) await updateForm(editingForm.id, values);
      else await createForm(values);
      setShowFormDialog(false);
      setEditingForm(null);
    } finally { setFormLoading(false); }
  }, [editingForm, createForm, updateForm]);

  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c.name])), [carriers]);
  const lobMap = useMemo(() => new Map(lines.map((l) => [l.id, l.name])), [lines]);

  const columns: Column<FormPaper>[] = useMemo(() => [
    { key: 'name', header: 'Form Name', sortable: true },
    { key: 'form_number', header: 'Number', sortable: true },
    { key: 'carrier_id', header: 'Carrier', render: (v) => carrierMap.get(v as string) ?? '—' },
    { key: 'line_of_business_id', header: 'Line', render: (v) => lobMap.get(v as string) ?? '—' },
    { key: 'type', header: 'Type', sortable: true, render: (v) => (v as string).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
    { key: 'edition_date', header: 'Edition' },
  ], [carrierMap, lobMap]);

  return (
    <div>
      <PageHeader title="Forms & Paper Registry" description="Searchable registry of insurance forms and papers."
        action={{ label: 'New Form', onClick: () => { setEditingForm(null); setShowFormDialog(true); }, icon: <Plus className="h-4 w-4" /> }} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search forms..." />
        </div>
        <FilterBar filters={FILTERS} values={filterValues} onChange={(k, v) => { setFilterValues((p) => ({ ...p, [k]: v })); setPage(1); }} onClear={() => { setFilterValues({}); setPage(1); }} />
      </div>

      <DataTable<FormPaper>
        columns={columns} data={items as FormPaper[]} isLoading={isLoading}
        onRowClick={(row) => { setEditingForm(row); setShowFormDialog(true); }}
        page={meta.page} totalPages={meta.total_pages} onPageChange={setPage}
        sortField={sortField} sortOrder={sortOrder} onSort={handleSort}
        emptyMessage="No forms found." rowKey={(row) => row.id} />

      <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} title={editingForm ? 'Edit Form' : 'New Form'} size="lg">
        <FormForm initialValues={editingForm ?? undefined} carriers={carriers} lines={lines as LineOfBusiness[]} onSubmit={handleFormSubmit} onCancel={() => setShowFormDialog(false)} isLoading={formLoading} />
      </Dialog>
    </div>
  );
};

export default FormsPaperRegistry;
