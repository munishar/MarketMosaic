import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { Input } from '@/components/ui/Input';

/** Handles reference fields with basic text input for ID/lookup */
export const RefFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <Input
      label={field.label}
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`${field.reference_entity ?? 'reference'} ID`}
      error={error}
      required={field.required}
      disabled={disabled}
      helperText={field.reference_entity ? `References: ${field.reference_entity}` : undefined}
    />
  );
};
