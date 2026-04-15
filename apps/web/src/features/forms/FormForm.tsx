import React from 'react';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import { FormPaperType, createFormPaperSchema, type FormPaper, type Carrier, type LineOfBusiness } from '@marketmosaic/shared';

const typeOptions = Object.values(FormPaperType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

function buildFormFields(carriers: Carrier[], lines: LineOfBusiness[]): FieldConfig[] {
  return [
    { name: 'name', label: 'Form Name', type: 'text', required: true, placeholder: 'e.g. CG 00 01' },
    { name: 'form_number', label: 'Form Number', type: 'text', placeholder: 'e.g. CG 00 01 04 13' },
    { name: 'carrier_id', label: 'Carrier', type: 'select', required: true, options: carriers.map((c) => ({ value: c.id, label: c.name })) },
    { name: 'line_of_business_id', label: 'Line of Business', type: 'select', required: true, options: lines.map((l) => ({ value: l.id, label: l.name })) },
    { name: 'type', label: 'Type', type: 'select', required: true, options: typeOptions },
    { name: 'edition_date', label: 'Edition Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this form...' },
  ];
}

interface FormFormProps {
  initialValues?: Partial<FormPaper>;
  carriers?: Carrier[];
  lines?: LineOfBusiness[];
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const FormForm: React.FC<FormFormProps> = ({ initialValues, carriers = [], lines = [], onSubmit, onCancel, isLoading }) => {
  return (
    <EntityForm
      fields={buildFormFields(carriers, lines)}
      schema={createFormPaperSchema}
      initialValues={initialValues as Record<string, unknown>}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Form' : 'Create Form'}
    />
  );
};
