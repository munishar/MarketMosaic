import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { Select } from '@/components/ui/Select';

/** Handles enum field type with dropdown */
export const EnumFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const options = (field.enum_values ?? []).map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' '),
  }));

  return (
    <Select
      label={field.label}
      options={options}
      value={String(value ?? '')}
      onChange={(v) => onChange(v)}
      error={error}
      disabled={disabled}
      placeholder={`Select ${field.label}...`}
    />
  );
};
