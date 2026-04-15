import React, { useState, useCallback, useMemo } from 'react';
import type { FieldSchema, UISection } from '@brokerflow/manifest';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { useDynamicEntity } from './hooks/useDynamicEntity';
import { useDynamicPermissions } from './hooks/useDynamicPermissions';
import type { ManifestOverrides } from './hooks/useManifest';

export interface DynamicEntityFormProps {
  entityKey: string;
  mode: 'create' | 'edit';
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  overrides?: ManifestOverrides;
}

/** Build a Zod schema dynamically from field definitions */
function buildZodSchema(fields: FieldSchema[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.field_type) {
      case 'number': {
        let numSchema = z.number({ coerce: true });
        if (field.validation_rules?.min != null) numSchema = numSchema.min(field.validation_rules.min);
        if (field.validation_rules?.max != null) numSchema = numSchema.max(field.validation_rules.max);
        fieldSchema = numSchema;
        break;
      }

      case 'decimal':
        fieldSchema = z.number({ coerce: true });
        break;

      case 'boolean':
        fieldSchema = z.boolean();
        break;

      case 'array':
        fieldSchema = z.array(z.string());
        break;

      case 'json':
      case 'address':
        fieldSchema = z.unknown();
        break;

      default: {
        let strSchema = z.string();
        if (field.validation_rules?.min_length != null) strSchema = strSchema.min(field.validation_rules.min_length);
        if (field.validation_rules?.max_length != null) strSchema = strSchema.max(field.validation_rules.max_length);
        if (field.field_type === 'email') strSchema = strSchema.email('Invalid email');
        if (field.field_type === 'url') strSchema = strSchema.url('Invalid URL');
        fieldSchema = strSchema;
        break;
      }
    }

    if (!field.required) {
      // For string-based fields, allow empty strings; for others use nullable/optional
      const isStringType = !['number', 'decimal', 'boolean', 'array', 'json', 'address'].includes(field.field_type);
      fieldSchema = isStringType
        ? fieldSchema.optional().or(z.literal(''))
        : fieldSchema.nullish();
    }

    shape[field.field_name] = fieldSchema;
  }

  return z.object(shape);
}

/**
 * Config-driven entity form with dynamic field rendering and Zod validation.
 */
export const DynamicEntityForm: React.FC<DynamicEntityFormProps> = ({
  entityKey,
  mode,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading,
  overrides,
}) => {
  const { entity, formFields, createLayout, editLayout } = useDynamicEntity(entityKey, overrides);
  const permissions = useDynamicPermissions(entityKey, overrides);
  const layout = mode === 'create' ? createLayout : editLayout;

  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    formFields.forEach((f) => {
      init[f.field_name] = initialValues[f.field_name] ?? f.default_value ?? '';
    });
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = useMemo(() => buildZodSchema(formFields), [formFields]);

  const handleChange = useCallback((fieldName: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

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

  // Build a lookup for fields by name
  const fieldsByName = useMemo(() => {
    const map = new Map<string, FieldSchema>();
    formFields.forEach((f) => map.set(f.field_name, f));
    return map;
  }, [formFields]);

  const canSubmit = mode === 'create' ? permissions.canCreate : permissions.canUpdate;

  if (!entity) {
    return <div className="text-gray-500 p-4">Entity &quot;{entityKey}&quot; not found</div>;
  }

  const renderSection = (section: UISection, sectionIdx: number) => {
    const sectionFields = section.fields
      .map((name) => fieldsByName.get(name))
      .filter((f): f is FieldSchema => f !== undefined);

    if (sectionFields.length === 0) return null;

    return (
      <fieldset key={sectionIdx} className="space-y-4">
        {section.title && (
          <legend className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 w-full">
            {section.title}
          </legend>
        )}
        <div
          className={`grid gap-4 ${section.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
        >
          {sectionFields.map((field) => (
            <DynamicFieldRenderer
              key={field.key}
              field={field}
              value={values[field.field_name]}
              onChange={(val) => handleChange(field.field_name, val)}
              error={errors[field.field_name]}
              disabled={!canSubmit}
            />
          ))}
        </div>
      </fieldset>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {mode === 'create' ? `New ${entity.name}` : `Edit ${entity.name}`}
      </h2>

      {layout?.sections.map((section, idx) => renderSection(section, idx))}

      <div className="flex items-center gap-3 pt-4">
        {canSubmit && (
          <Button type="submit" isLoading={isLoading}>
            {mode === 'create' ? `Create ${entity.name}` : 'Save Changes'}
          </Button>
        )}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default DynamicEntityForm;
