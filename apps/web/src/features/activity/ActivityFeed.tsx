import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EntityType } from '@brokerflow/shared';
import { useActivities } from './hooks/useActivities';
import { ActivityItem } from './ActivityItem';

const entityFilterOptions = [
  { value: '', label: 'All Entities' },
  ...Object.values(EntityType).map((v) => ({
    value: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
];

export const ActivityFeed: React.FC = () => {
  const { items, isLoading, meta, fetchActivities, loadMore } = useActivities();
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    const params: Record<string, unknown> = {};
    if (entityFilter) params.entity_type = entityFilter;
    fetchActivities(params);
  }, [fetchActivities, entityFilter]);

  const handleLoadMore = () => {
    if (meta.page < meta.total_pages) {
      const params: Record<string, unknown> = {};
      if (entityFilter) params.entity_type = entityFilter;
      loadMore(meta.page + 1, params);
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <ActivityIcon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
        <div className="ml-auto w-48">
          <Select
            options={entityFilterOptions}
            value={entityFilter}
            onChange={setEntityFilter}
            placeholder="Filter by entity"
          />
        </div>
      </div>

      {/* Timeline */}
      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <ActivityIcon className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((activity, idx) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={idx === items.length - 1}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {meta.page < meta.total_pages && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            isLoading={isLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};
