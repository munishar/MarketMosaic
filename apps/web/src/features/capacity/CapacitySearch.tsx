import React, { useMemo, useState } from 'react';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { Card } from '@/components/ui/Card';
import type { Carrier, LineOfBusiness } from '@brokerflow/shared';

interface CapacitySearchProps {
  carriers: Carrier[];
  lines: LineOfBusiness[];
  onSearch: (filters: Record<string, string>) => void;
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export const CapacitySearch: React.FC<CapacitySearchProps> = ({ carriers, lines, onSearch }) => {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const FILTERS: FilterDef[] = useMemo(() => [
    { key: 'carrier_id', label: 'Carrier', options: carriers.map((c) => ({ value: c.id, label: c.name })) },
    { key: 'line_of_business_id', label: 'Line', options: lines.map((l) => ({ value: l.id, label: l.name })) },
    { key: 'state', label: 'State', options: US_STATES.map((s) => ({ value: s, label: s })) },
  ], [carriers, lines]);

  const handleFilterChange = (key: string, value: string) => {
    const next = { ...filterValues, [key]: value };
    setFilterValues(next);
    onSearch({ ...next, search });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch({ ...filterValues, search: value });
  };

  const handleClear = () => {
    setFilterValues({});
    setSearch('');
    onSearch({});
  };

  return (
    <Card padding="md" className="mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={handleSearchChange} placeholder="Search capacity..." />
        </div>
        <FilterBar filters={FILTERS} values={filterValues} onChange={handleFilterChange} onClear={handleClear} />
      </div>
    </Card>
  );
};
