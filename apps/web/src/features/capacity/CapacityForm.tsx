import React from 'react';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import { createCapacitySchema, type UnderwriterCapacity, type Contact, type Carrier, type LineOfBusiness } from '@brokerflow/shared';

function buildCapacityFields(contacts: Contact[], carriers: Carrier[], lines: LineOfBusiness[]): FieldConfig[] {
  return [
    { name: 'contact_id', label: 'Underwriter', type: 'select', required: true, options: contacts.map((c) => ({ value: c.id, label: `${c.first_name} ${c.last_name}` })) },
    { name: 'carrier_id', label: 'Carrier', type: 'select', required: true, options: carriers.map((c) => ({ value: c.id, label: c.name })) },
    { name: 'line_of_business_id', label: 'Line of Business', type: 'select', required: true, options: lines.map((l) => ({ value: l.id, label: l.name })) },
    { name: 'min_limit', label: 'Min Limit', type: 'text', placeholder: 'e.g. $1,000,000' },
    { name: 'max_limit', label: 'Max Limit', type: 'text', placeholder: 'e.g. $10,000,000' },
    { name: 'deployed_capacity', label: 'Deployed Capacity', type: 'text', placeholder: 'e.g. $5,000,000' },
    { name: 'available_capacity', label: 'Available Capacity', type: 'text', placeholder: 'e.g. $5,000,000' },
    { name: 'sir_range', label: 'SIR Range', type: 'text', placeholder: 'e.g. $10K - $100K' },
    { name: 'deductible_range', label: 'Deductible Range', type: 'text', placeholder: 'e.g. $5K - $50K' },
    { name: 'appetite_notes', label: 'Appetite Notes', type: 'textarea', placeholder: 'Notes about appetite...' },
  ];
}

interface CapacityFormProps {
  initialValues?: Partial<UnderwriterCapacity>;
  contacts?: Contact[];
  carriers?: Carrier[];
  lines?: LineOfBusiness[];
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CapacityForm: React.FC<CapacityFormProps> = ({ initialValues, contacts = [], carriers = [], lines = [], onSubmit, onCancel, isLoading }) => {
  return (
    <EntityForm
      fields={buildCapacityFields(contacts, carriers, lines)}
      schema={createCapacitySchema}
      initialValues={initialValues as Record<string, unknown>}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Capacity' : 'Create Capacity'}
    />
  );
};
