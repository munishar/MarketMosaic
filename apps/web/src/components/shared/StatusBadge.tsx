import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { SubmissionStatus, ClientStatus, SyncJobStatus } from '@brokerflow/shared';

type StatusType = SubmissionStatus | ClientStatus | SyncJobStatus | string;

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'default'> = {
  active: 'success',
  bound: 'success',
  complete: 'success',
  connected: 'success',
  confirmed: 'success',
  fresh: 'success',

  prospect: 'primary',
  draft: 'default',
  submitted: 'primary',
  reviewing: 'primary',
  queued: 'primary',
  running: 'primary',
  pending: 'primary',
  importing: 'primary',

  quoted: 'secondary',
  aging: 'secondary',
  partial: 'secondary',

  expired: 'warning',
  stale: 'warning',
  refresh_pending: 'warning',

  declined: 'danger',
  lost: 'danger',
  inactive: 'danger',
  failed: 'danger',
  error: 'danger',
  cancelled: 'danger',
  disconnected: 'danger',
};

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const variant = statusVariantMap[status] || 'default';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};
