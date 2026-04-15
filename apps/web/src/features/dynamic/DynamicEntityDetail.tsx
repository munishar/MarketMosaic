import React, { useMemo } from 'react';
import type { FieldSchema } from '@marketmosaic/manifest';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { useDynamicEntity } from './hooks/useDynamicEntity';
import type { ManifestOverrides } from './hooks/useManifest';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

export interface DynamicEntityDetailProps {
  entityKey: string;
  data: Record<string, unknown>;
  overrides?: ManifestOverrides;
}

function renderFieldValue(field: FieldSchema, value: unknown): React.ReactNode {
  if (value == null || value === '') return <span className="text-gray-400">—</span>;

  switch (field.field_type) {
    case 'boolean':
      return <Badge variant={value ? 'success' : 'default'}>{value ? 'Yes' : 'No'}</Badge>;

    case 'date':
      return formatDate(String(value));

    case 'datetime':
      return formatDateTime(String(value));

    case 'enum':
      return (
        <Badge variant="primary">
          {String(value).charAt(0).toUpperCase() + String(value).slice(1).replace(/_/g, ' ')}
        </Badge>
      );

    case 'decimal':
      return typeof value === 'number' ? formatCurrency(value) : String(value);

    case 'url':
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:underline"
        >
          {String(value)}
        </a>
      );

    case 'email':
      return (
        <a href={`mailto:${String(value)}`} className="text-secondary hover:underline">
          {String(value)}
        </a>
      );

    case 'array':
      return Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {(value as string[]).map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        String(value)
      );

    case 'address':
      if (typeof value === 'object' && value !== null) {
        const addr = value as Record<string, string>;
        const parts = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean);
        return parts.join(', ') || '—';
      }
      return String(value);

    case 'rich_text':
      return <div className="whitespace-pre-wrap text-sm">{String(value)}</div>;

    default:
      return String(value);
  }
}

/**
 * Config-driven entity detail view with tabbed sections.
 */
export const DynamicEntityDetail: React.FC<DynamicEntityDetailProps> = ({
  entityKey,
  data,
  overrides,
}) => {
  const { entity, detailFields, detailLayout } = useDynamicEntity(entityKey, overrides);

  const fieldsByName = useMemo(() => {
    const map = new Map<string, FieldSchema>();
    detailFields.forEach((f) => map.set(f.field_name, f));
    return map;
  }, [detailFields]);

  const tabs: TabItem[] = useMemo(() => {
    if (!detailLayout) return [];

    return detailLayout.sections.map((section, idx) => {
      const sectionFields = section.fields
        .map((name) => fieldsByName.get(name))
        .filter((f): f is FieldSchema => f !== undefined);

      return {
        key: `section-${idx}`,
        label: section.title || `Section ${idx + 1}`,
        content: (
          <div
            className={`grid gap-4 ${section.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {sectionFields.map((field) => (
              <div key={field.key} className="space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.label}
                </dt>
                <dd className="text-sm text-gray-900">
                  {renderFieldValue(field, data[field.field_name])}
                </dd>
              </div>
            ))}
          </div>
        ),
      };
    });
  }, [detailLayout, fieldsByName, data]);

  if (!entity) {
    return <div className="text-gray-500 p-4">Entity &quot;{entityKey}&quot; not found</div>;
  }

  const primaryValue = data[entity.primary_field];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {primaryValue ? String(primaryValue) : entity.name}
      </h2>

      {tabs.length === 1 ? (
        tabs[0].content
      ) : (
        <Tabs items={tabs} />
      )}
    </div>
  );
};

export default DynamicEntityDetail;
