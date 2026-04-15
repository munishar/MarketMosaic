import React, { useCallback, useState } from 'react';
import type { ZodObject, ZodRawShape } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

export type FieldType = 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'url' | 'tel';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  helperText?: string;
  defaultValue?: string | number;
}

export interface EntityFormProps<T extends ZodRawShape> {
  fields: FieldConfig[];
  schema: ZodObject<T>;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function EntityForm<T extends ZodRawShape>({
  fields,
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Save',
}: EntityFormProps<T>) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => {
      init[f.name] = initialValues[f.name] ?? f.defaultValue ?? '';
    });
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const result = schema.safeParse(values);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      await onSubmit(result.data as Record<string, unknown>);
    },
    [values, schema, onSubmit],
  );

  const renderField = (field: FieldConfig) => {
    const value = values[field.name];
    const error = errors[field.name];

    if (field.type === 'select' && field.options) {
      return (
        <Select
          key={field.name}
          label={field.label}
          options={field.options}
          value={String(value ?? '')}
          onChange={(v) => handleChange(field.name, v)}
          error={error}
          placeholder={field.placeholder}
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <textarea
            value={String(value ?? '')}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
          />
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        type={field.type}
        value={String(value ?? '')}
        onChange={(e) =>
          handleChange(
            field.name,
            field.type === 'number' ? Number(e.target.value) : e.target.value,
          )
        }
        placeholder={field.placeholder}
        error={error}
        helperText={field.helperText}
        required={field.required}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(renderField)}

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
