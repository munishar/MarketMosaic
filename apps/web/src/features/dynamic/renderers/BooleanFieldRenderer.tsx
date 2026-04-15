import React from 'react';
import type { FieldRendererProps } from './TextFieldRenderer';
import { cn } from '@/lib/utils';

/** Checkbox renderer for boolean fields */
export const BooleanFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const checked = value === true || value === 'true';

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            error && 'border-danger',
          )}
        />
        <span className="text-sm font-medium text-gray-700">{field.label}</span>
      </label>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};
