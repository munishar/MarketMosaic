import React from 'react';
import { Clock, CheckCircle, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { DataFreshnessStatus } from '@marketmosaic/shared';

export interface FreshnessBadgeProps {
  status: DataFreshnessStatus | string;
  lastVerified?: string | null;
  className?: string;
}

const config: Record<
  string,
  {
    variant: 'success' | 'warning' | 'danger' | 'primary' | 'default';
    icon: React.ReactNode;
    label: string;
  }
> = {
  fresh: {
    variant: 'success',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Fresh',
  },
  aging: {
    variant: 'warning',
    icon: <Clock className="h-3 w-3" />,
    label: 'Aging',
  },
  stale: {
    variant: 'danger',
    icon: <AlertTriangle className="h-3 w-3" />,
    label: 'Stale',
  },
  refresh_pending: {
    variant: 'primary',
    icon: <RefreshCw className="h-3 w-3" />,
    label: 'Refreshing',
  },
  refresh_failed: {
    variant: 'danger',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Failed',
  },
};

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status,
  lastVerified,
  className,
}) => {
  const cfg = config[status] || {
    variant: 'default' as const,
    icon: <Clock className="h-3 w-3" />,
    label: status,
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Badge variant={cfg.variant}>
        <span className="flex items-center gap-1">
          {cfg.icon}
          {cfg.label}
        </span>
      </Badge>
      {lastVerified && (
        <span className="text-xs text-gray-400">
          {new Date(lastVerified).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
