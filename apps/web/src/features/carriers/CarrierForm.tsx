import React from 'react';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import {
  CarrierType,
  createCarrierSchema,
  type Carrier,
} from '@marketmosaic/shared';

const carrierTypeOptions = Object.values(CarrierType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const appointedOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const CARRIER_FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Carrier Name', type: 'text', required: true, placeholder: 'Enter carrier name' },
  { name: 'type', label: 'Carrier Type', type: 'select', required: true, options: carrierTypeOptions },
  { name: 'am_best_rating', label: 'AM Best Rating', type: 'text', placeholder: 'e.g. A+ (Superior)' },
  { name: 'appointed', label: 'Appointed', type: 'select', options: appointedOptions, defaultValue: 'false' },
  { name: 'headquarters_state', label: 'HQ State', type: 'text', placeholder: 'e.g. NY' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://carrier.com' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
];

interface CarrierFormProps {
  initialValues?: Partial<Carrier>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CarrierForm: React.FC<CarrierFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const handleSubmit = async (values: Record<string, unknown>) => {
    // Convert appointed string to boolean for the API
    const transformed = {
      ...values,
      appointed: values.appointed === 'true',
    };
    await onSubmit(transformed);
  };

  const formInitialValues = initialValues
    ? {
        ...initialValues,
        appointed: initialValues.appointed ? 'true' : 'false',
      }
    : undefined;

  return (
    <EntityForm
      fields={CARRIER_FIELDS}
      schema={createCarrierSchema}
      initialValues={formInitialValues as Record<string, unknown>}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Carrier' : 'Create Carrier'}
    />
  );
};
