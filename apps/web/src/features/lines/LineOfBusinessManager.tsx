import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { LineForm } from './LineForm';
import { useLines } from './hooks/useLines';
import { LOBCategory, type LineOfBusiness } from '@brokerflow/shared';

const categoryOptions = Object.values(LOBCategory).map((c) => ({
  value: c,
  label: c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
}));

const FILTERS: FilterDef[] = [
  { key: 'category', label: 'Category', options: categoryOptions },
];

const categoryVariant: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
  casualty: 'primary',
  property: 'success',
  specialty: 'warning',
  financial_lines: 'secondary',
};

const LineOfBusinessManager: React.FC = () => {
  const { items, isLoading, fetchLines, createLine, updateLine } = useLines();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingLine, setEditingLine] = useState<LineOfBusiness | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void fetchLines({ search: search || undefined, ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v !== '')) });
  }, [fetchLines, search, filterValues]);

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true);
      try {
        if (editingLine) {
          await updateLine(editingLine.id, values);
        } else {
          await createLine(values);
        }
        setShowFormDialog(false);
        setEditingLine(null);
      } finally {
        setFormLoading(false);
      }
    },
    [editingLine, createLine, updateLine],
  );

  const parentLines = useMemo(() => items.filter((l) => !l.parent_line_id), [items]);
  const childMap = useMemo(() => {
    const map = new Map<string, LineOfBusiness[]>();
    items.forEach((l) => {
      if (l.parent_line_id) {
        const children = map.get(l.parent_line_id) || [];
        children.push(l);
        map.set(l.parent_line_id, children);
      }
    });
    return map;
  }, [items]);

  const filteredParents = useMemo(() => {
    let filtered = parentLines;
    if (filterValues.category) {
      filtered = filtered.filter((l) => l.category === filterValues.category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) => l.name.toLowerCase().includes(q) || l.abbreviation.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [parentLines, filterValues.category, search]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Lines of Business" description="Loading..." />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Lines of Business"
        description="Manage lines of business with parent-child hierarchy."
        action={{ label: 'New Line', onClick: () => { setEditingLine(null); setShowFormDialog(true); }, icon: <Plus className="h-4 w-4" /> }}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={setSearch} placeholder="Search lines..." />
        </div>
        <FilterBar filters={FILTERS} values={filterValues} onChange={(k, v) => setFilterValues((prev) => ({ ...prev, [k]: v }))} onClear={() => setFilterValues({})} />
      </div>

      <div className="space-y-3">
        {filteredParents.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8 text-sm text-gray-500">No lines of business found.</div>
          </Card>
        ) : (
          filteredParents.map((parent) => {
            const children = childMap.get(parent.id) || [];
            return (
              <Card key={parent.id} padding="none" className="overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => { setEditingLine(parent); setShowFormDialog(true); }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={categoryVariant[parent.category] || 'default'}>{parent.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
                    <span className="font-medium text-gray-900">{parent.name}</span>
                    <span className="text-xs text-gray-500">({parent.abbreviation})</span>
                  </div>
                  {children.length > 0 && <span className="text-xs text-gray-400">{children.length} sub-lines</span>}
                </div>
                {children.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 px-4 py-2 pl-10 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => { setEditingLine(child); setShowFormDialog(true); }}
                      >
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span>{child.name}</span>
                        <span className="text-xs text-gray-400">({child.abbreviation})</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={showFormDialog} onClose={() => setShowFormDialog(false)} title={editingLine ? 'Edit Line' : 'New Line'} size="lg">
        <LineForm initialValues={editingLine ?? undefined} allLines={items as LineOfBusiness[]} onSubmit={handleFormSubmit} onCancel={() => setShowFormDialog(false)} isLoading={formLoading} />
      </Dialog>
    </div>
  );
};

export default LineOfBusinessManager;
