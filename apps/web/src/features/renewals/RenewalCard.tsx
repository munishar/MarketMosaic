import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Submission } from '@marketmosaic/shared';
import { SubmissionStatus } from '@marketmosaic/shared';

interface RenewalCardProps {
  submission: Submission;
  onClick?: (submission: Submission) => void;
}

function getDaysUntilExpiry(expirationDate: string): number {
  const expiry = new Date(expirationDate);
  const now = new Date();
  return Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getStatusColor(
  status: SubmissionStatus,
  daysUntilExpiry: number,
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === SubmissionStatus.bound) return 'success';
  if (
    status === SubmissionStatus.submitted ||
    status === SubmissionStatus.quoted
  ) {
    return 'warning';
  }
  if (
    status === SubmissionStatus.expired ||
    status === SubmissionStatus.draft ||
    daysUntilExpiry < 0
  ) {
    return 'danger';
  }
  if (status === SubmissionStatus.lost || status === SubmissionStatus.declined) {
    return 'default';
  }
  return 'warning';
}

function getExpiryBadge(days: number): React.ReactNode {
  if (days < 0) {
    return <Badge variant="danger">Expired {Math.abs(days)}d ago</Badge>;
  }
  if (days <= 30) {
    return <Badge variant="danger">{days}d remaining</Badge>;
  }
  if (days <= 60) {
    return <Badge variant="warning">{days}d remaining</Badge>;
  }
  return <Badge variant="default">{days}d remaining</Badge>;
}

export const RenewalCard: React.FC<RenewalCardProps> = ({
  submission,
  onClick,
}) => {
  const daysUntilExpiry = getDaysUntilExpiry(submission.expiration_date);
  const statusColor = getStatusColor(submission.status, daysUntilExpiry);

  return (
    <Card
      padding="sm"
      hoverable
      onClick={onClick ? () => onClick(submission) : undefined}
      className="cursor-pointer"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <p className="truncate text-sm font-semibold text-gray-900">
            {submission.client_id}
          </p>
          <Badge variant={statusColor}>
            {submission.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {submission.lines_requested.map((line) => (
            <span
              key={line.line_of_business_id}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
            >
              {line.line_of_business_id}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Expires: {formatDate(submission.expiration_date)}
          </span>
          {getExpiryBadge(daysUntilExpiry)}
        </div>
      </div>
    </Card>
  );
};
