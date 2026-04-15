import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { cn } from '@/lib/utils';

/** Textarea renderer for rich_text fields */
export const RichTextFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
      <textarea
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        disabled={disabled}
        rows={4}
        className={cn(
          'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-danger focus:border-danger focus:ring-danger',
        )}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};
