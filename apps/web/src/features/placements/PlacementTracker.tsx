import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { PlacementCard } from './PlacementCard';
import { PlacementDetail } from './PlacementDetail';
import { usePlacements } from './hooks/usePlacements';
import { cn } from '@/lib/utils';
import type { SubmissionTarget } from '@marketmosaic/shared';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  declined: 'Declined',
  bound: 'Bound',
  expired: 'Expired',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 border-gray-300',
  submitted: 'bg-blue-50 border-blue-200',
  reviewing: 'bg-yellow-50 border-yellow-200',
  quoted: 'bg-indigo-50 border-indigo-200',
  declined: 'bg-red-50 border-red-200',
  bound: 'bg-green-50 border-green-200',
  expired: 'bg-gray-50 border-gray-200',
};

const PlacementTracker: React.FC = () => {
  const { groups, isLoading, fetchPlacements } = usePlacements();
  const [selectedTarget, setSelectedTarget] =
    useState<SubmissionTarget | null>(null);

  useEffect(() => {
    void fetchPlacements();
  }, [fetchPlacements]);

  const handleCardClick = useCallback((target: SubmissionTarget) => {
    setSelectedTarget(target);
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Placements"
          description="Track placement lifecycle across carriers."
        />
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2E75B6]" />
          <span className="ml-3 text-sm text-gray-500">
            Loading placements...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Placements"
        description="Track placement lifecycle across carriers."
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {groups.map((group) => (
          <div
            key={group.status}
            className={cn(
              'flex min-w-[260px] flex-shrink-0 flex-col rounded-lg border',
              STATUS_COLORS[group.status] ?? 'bg-gray-50 border-gray-200',
            )}
          >
            <div className="flex items-center justify-between border-b border-inherit px-3 py-2">
              <span className="text-sm font-semibold text-gray-800">
                {STATUS_LABELS[group.status] ?? group.status}
              </span>
              <Badge variant="default">{group.targets.length}</Badge>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {group.targets.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  No placements
                </p>
              ) : (
                group.targets.map((target) => (
                  <PlacementCard
                    key={target.id}
                    target={target}
                    onClick={handleCardClick}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={selectedTarget !== null}
        onClose={() => setSelectedTarget(null)}
        title="Placement Details"
        size="lg"
      >
        {selectedTarget && <PlacementDetail target={selectedTarget} />}
      </Dialog>
    </div>
  );
};

export default PlacementTracker;
