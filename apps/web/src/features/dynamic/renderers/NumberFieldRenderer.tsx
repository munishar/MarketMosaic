import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { Input } from '@/components/ui/Input';

/** Handles number and decimal field types */
export const NumberFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const step = field.field_type === 'decimal' ? '0.01' : '1';

  return (
    <Input
      label={field.label}
      type="number"
      value={value != null ? String(value) : ''}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') {
          onChange(null);
        } else {
          onChange(field.field_type === 'decimal' ? parseFloat(raw) : parseInt(raw, 10));
        }
      }}
      placeholder={field.label}
      error={error}
      required={field.required}
      disabled={disabled}
      step={step}
      min={field.validation_rules?.min}
      max={field.validation_rules?.max}
    />
  );
};
