import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { Input } from '@/components/ui/Input';

/** Handles date and datetime field types */
export const DateFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const inputType = field.field_type === 'datetime' ? 'datetime-local' : 'date';

  return (
    <Input
      label={field.label}
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required={field.required}
      disabled={disabled}
    />
  );
};
