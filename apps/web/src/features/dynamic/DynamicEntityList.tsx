import React, { useMemo, useState, useCallback } from 'react';
import type { FieldSchema } from '@marketmosaic/manifest';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/Button';
import { useDynamicEntity } from './hooks/useDynamicEntity';
import { useDynamicPermissions } from './hooks/useDynamicPermissions';
import type { ManifestOverrides } from './hooks/useManifest';

export interface DynamicEntityListProps {
  entityKey: string;
  data?: Record<string, unknown>[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  onCreateClick?: () => void;
  overrides?: ManifestOverrides;
}

function buildColumnRender(field: FieldSchema) {
  return (value: unknown): React.ReactNode => {
    if (value == null) return '—';

    switch (field.field_type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return typeof value === 'string'
          ? new Date(value).toLocaleDateString()
          : String(value);
      case 'datetime':
        return typeof value === 'string'
          ? new Date(value).toLocaleString()
          : String(value);
      case 'enum':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1).replace(/_/g, ' ');
      case 'decimal':
        return typeof value === 'number'
          ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value)
          : String(value);
      case 'array':
        return Array.isArray(value) ? value.join(', ') : String(value);
      default:
        return String(value);
    }
  };
}

/**
 * Config-driven entity list view powered by DataTable.
 */
export const DynamicEntityList: React.FC<DynamicEntityListProps> = ({
  entityKey,
  data = [],
  isLoading,
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  onCreateClick,
  overrides,
}) => {
  const { entity, listFields } = useDynamicEntity(entityKey, overrides);
  const permissions = useDynamicPermissions(entityKey, overrides);
  const [sortField, setSortField] = useState<string>(entity?.default_sort.field ?? '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(entity?.default_sort.order ?? 'asc');

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField],
  );

  const columns: Column<Record<string, unknown>>[] = useMemo(
    () =>
      listFields.map((field) => ({
        key: field.field_name,
        header: field.label,
        sortable: field.sortable,
        render: buildColumnRender(field),
      })),
    [listFields],
  );

  if (!entity) {
    return <div className="text-gray-500 p-4">Entity &quot;{entityKey}&quot; not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{entity.plural_name}</h2>
        {permissions.canCreate && onCreateClick && (
          <Button onClick={onCreateClick}>Add {entity.name}</Button>
        )}
      </div>

      <DataTable<Record<string, unknown>>
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowClick={onRowClick}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={`No ${entity.plural_name.toLowerCase()} found`}
        rowKey={(row) => String(row.id ?? row[entity.primary_field] ?? '')}
      />
    </div>
  );
};

export default DynamicEntityList;
