import React from 'react';
import type { FieldSchema } from '@marketmosaic/manifest';
import { Input } from '@/components/ui/Input';

export interface FieldRendererProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

/** Handles text, email, phone, url field types */
export const TextFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const typeMap: Record<string, string> = {
    text: 'text',
    email: 'email',
    phone: 'tel',
    url: 'url',
  };

  const inputType = typeMap[field.field_type] ?? 'text';

  return (
    <Input
      label={field.label}
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      error={error}
      required={field.required}
      disabled={disabled}
    />
  );
};
