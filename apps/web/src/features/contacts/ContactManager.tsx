import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Dialog } from '@/components/ui/Dialog';
import { ContactForm } from './ContactForm';
import { ContactDetail } from './ContactDetail';
import { useContacts } from './hooks/useContacts';
import { useAppStore } from '@/store';
import { ContactType, type Contact, type Carrier } from '@brokerflow/shared';

const contactTypeOptions = Object.values(ContactType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const ContactManager: React.FC = () => {
  const { items, isLoading, meta, fetchContacts, createContact, updateContact } =
    useContacts();

  const carriers = useAppStore((s) => s.carriers.items) as Carrier[];

  const carrierFilterOptions = useMemo(
    () => carriers.map((c) => ({ value: c.id, label: c.name })),
    [carriers],
  );

  const FILTERS: FilterDef[] = useMemo(
    () => [
      { key: 'contact_type', label: 'Type', options: contactTypeOptions },
      { key: 'carrier_id', label: 'Carrier', options: carrierFilterOptions },
    ],
    [carrierFilterOptions],
  );

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
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
    void fetchContacts(fetchParams);
  }, [fetchContacts, fetchParams]);

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
    setEditingContact(null);
    setShowFormDialog(true);
  }, []);

  const handleEdit = useCallback((contact: Contact) => {
    setEditingContact(contact);
    setShowFormDialog(true);
    setSelectedContact(null);
  }, []);

  const handleRowClick = useCallback((row: Contact) => {
    setSelectedContact(row);
  }, []);

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true);
      try {
        if (editingContact) {
          await updateContact(editingContact.id, values);
        } else {
          await createContact(values);
        }
        setShowFormDialog(false);
        setEditingContact(null);
      } finally {
        setFormLoading(false);
      }
    },
    [editingContact, createContact, updateContact],
  );

  const carrierMap = useMemo(() => {
    const map = new Map<string, string>();
    carriers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [carriers]);

  const columns: Column<Contact>[] = useMemo(
    () => [
      { key: 'first_name', header: 'First Name', sortable: true },
      { key: 'last_name', header: 'Last Name', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      {
        key: 'contact_type',
        header: 'Type',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'carrier_id',
        header: 'Carrier',
        render: (value) => (value ? carrierMap.get(value as string) ?? '—' : '—'),
      },
      { key: 'region', header: 'Region', sortable: true },
    ],
    [carrierMap],
  );

  if (selectedContact) {
    return (
      <div>
        <PageHeader
          title={`${selectedContact.first_name} ${selectedContact.last_name}`}
          description={selectedContact.title ?? undefined}
          action={{
            label: 'Edit Contact',
            onClick: () => handleEdit(selectedContact),
          }}
        />
        <button
          onClick={() => setSelectedContact(null)}
          className="mb-4 text-sm text-secondary hover:underline"
        >
          ← Back to Contacts
        </button>
        <ContactDetail contact={selectedContact} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage underwriters, wholesalers, and other external contacts."
        action={{
          label: 'New Contact',
          onClick: handleCreate,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
          />
        </div>
        <FilterBar
          filters={FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      </div>

      <DataTable<Contact>
        columns={columns}
        data={items as Contact[]}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No contacts found. Add your first contact to get started."
        rowKey={(row) => row.id}
      />

      <Dialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        title={editingContact ? 'Edit Contact' : 'New Contact'}
        size="lg"
      >
        <ContactForm
          initialValues={editingContact ?? undefined}
          carriers={carriers}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormDialog(false)}
          isLoading={formLoading}
        />
      </Dialog>
    </div>
  );
};

export default ContactManager;
