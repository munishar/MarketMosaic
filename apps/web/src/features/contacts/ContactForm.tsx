import React from 'react';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import {
  ContactType,
  createContactSchema,
  type Contact,
  type Carrier,
} from '@brokerflow/shared';

const contactTypeOptions = Object.values(ContactType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

function buildContactFields(carriers: Carrier[]): FieldConfig[] {
  return [
    { name: 'first_name', label: 'First Name', type: 'text', required: true, placeholder: 'First name' },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true, placeholder: 'Last name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'email@example.com' },
    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 555-5555' },
    { name: 'contact_type', label: 'Contact Type', type: 'select', required: true, options: contactTypeOptions },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'e.g. Senior Underwriter' },
    {
      name: 'carrier_id',
      label: 'Carrier',
      type: 'select',
      options: [
        { value: '', label: 'No carrier' },
        ...carriers.map((c) => ({ value: c.id, label: c.name })),
      ],
    },
    { name: 'region', label: 'Region', type: 'text', placeholder: 'e.g. Northeast' },
    { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
  ];
}

interface ContactFormProps {
  initialValues?: Partial<Contact>;
  carriers?: Carrier[];
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  initialValues,
  carriers = [],
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const fields = buildContactFields(carriers);

  return (
    <EntityForm
      fields={fields}
      schema={createContactSchema}
      initialValues={initialValues as Record<string, unknown>}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Contact' : 'Create Contact'}
    />
  );
};
