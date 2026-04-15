import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

export interface FilterDef {
  key: string;
  label: string;
  options: SelectOption[];
}

export interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  className,
}) => {
  const hasActiveFilters = Object.values(values).some((v) => v !== '');

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[160px]">
          <Select
            options={[{ value: '', label: `All ${filter.label}` }, ...filter.options]}
            value={values[filter.key] || ''}
            onChange={(v) => onChange(filter.key, v)}
            placeholder={filter.label}
          />
        </div>
      ))}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
};
