import React from 'react';
import { z } from 'zod';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import {
  ClientStatus,
  createClientSchema,
  type Client,
} from '@marketmosaic/shared';

const clientFormSchema = createClientSchema.pick({
  company_name: true,
  dba: true,
  status: true,
  industry: true,
  naics_code: true,
  website: true,
  primary_contact_name: true,
  primary_contact_email: true,
  primary_contact_phone: true,
  notes: true,
}).extend({
  revenue: z.coerce.number().nullable().optional(),
  employee_count: z.coerce.number().int().nullable().optional(),
});

const statusOptions = Object.values(ClientStatus).map((s) => ({
  value: s,
  label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const CLIENT_FIELDS: FieldConfig[] = [
  { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Enter company name' },
  { name: 'dba', label: 'DBA', type: 'text', placeholder: 'Doing business as' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptions, defaultValue: ClientStatus.prospect },
  { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. Manufacturing' },
  { name: 'naics_code', label: 'NAICS Code', type: 'text', placeholder: '6-digit NAICS' },
  { name: 'revenue', label: 'Revenue ($)', type: 'number', placeholder: 'Annual revenue' },
  { name: 'employee_count', label: 'Employees', type: 'number', placeholder: 'Number of employees' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
  { name: 'primary_contact_name', label: 'Primary Contact', type: 'text', placeholder: 'Full name' },
  { name: 'primary_contact_email', label: 'Contact Email', type: 'email', placeholder: 'email@example.com' },
  { name: 'primary_contact_phone', label: 'Contact Phone', type: 'tel', placeholder: '(555) 555-5555' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
];

interface ClientFormProps {
  initialValues?: Partial<Client>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  return (
    <EntityForm
      fields={CLIENT_FIELDS}
      schema={clientFormSchema}
      initialValues={initialValues as Record<string, unknown>}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Client' : 'Create Client'}
    />
  );
};
