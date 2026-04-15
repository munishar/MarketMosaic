import React from 'react';
import { EntityForm, type FieldConfig } from '@/components/shared/EntityForm';
import {
  LOBCategory,
  createLineOfBusinessSchema,
  type LineOfBusiness,
} from '@marketmosaic/shared';

const categoryOptions = Object.values(LOBCategory).map((c) => ({
  value: c,
  label: c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
}));

function buildLineFields(parentLines: LineOfBusiness[]): FieldConfig[] {
  return [
    { name: 'name', label: 'Line Name', type: 'text', required: true, placeholder: 'e.g. General Liability' },
    { name: 'abbreviation', label: 'Abbreviation', type: 'text', required: true, placeholder: 'e.g. GL' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: categoryOptions },
    {
      name: 'parent_line_id',
      label: 'Parent Line',
      type: 'select',
      options: [
        { value: '', label: 'None (top-level)' },
        ...parentLines
          .filter((l) => !l.parent_line_id)
          .map((l) => ({ value: l.id, label: l.name })),
      ],
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this line of business...' },
  ];
}

interface LineFormProps {
  initialValues?: Partial<LineOfBusiness>;
  allLines?: LineOfBusiness[];
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const LineForm: React.FC<LineFormProps> = ({
  initialValues,
  allLines = [],
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const fields = buildLineFields(allLines);

  return (
    <EntityForm
      fields={fields}
      schema={createLineOfBusinessSchema}
      initialValues={initialValues as Record<string, unknown>}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={initialValues?.id ? 'Update Line' : 'Create Line'}
    />
  );
};
