import React from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { SubmissionTarget } from '@marketmosaic/shared';

interface PlacementCardProps {
  target: SubmissionTarget;
  onClick: (target: SubmissionTarget) => void;
}

function getAgingDays(sentAt: string | null): number | null {
  if (!sentAt) return null;
  const sent = new Date(sentAt);
  const now = new Date();
  return Math.floor((now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

function getAgingBadge(days: number | null): React.ReactNode {
  if (days === null) return null;
  if (days > 14) {
    return <Badge variant="danger">{days}d overdue</Badge>;
  }
  if (days > 7) {
    return <Badge variant="warning">{days}d aging</Badge>;
  }
  return null;
}

export const PlacementCard: React.FC<PlacementCardProps> = ({
  target,
  onClick,
}) => {
  const agingDays = getAgingDays(target.sent_at);

  return (
    <Card
      padding="sm"
      hoverable
      onClick={() => onClick(target)}
      className="cursor-pointer"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {target.carrier_id}
            </p>
            <p className="truncate text-xs text-gray-500">
              {target.contact_id}
            </p>
          </div>
          <StatusBadge status={target.status} />
        </div>

        <p className="text-xs text-gray-500">{target.line_of_business_id}</p>

        {target.quoted_premium !== null && (
          <p className="text-sm font-medium text-gray-800">
            {formatCurrency(target.quoted_premium)}
          </p>
        )}

        <div className="flex items-center gap-2">
          {getAgingBadge(agingDays)}
          {target.quoted_limit !== null && (
            <span className="text-xs text-gray-400">
              Limit: {formatCurrency(target.quoted_limit)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
