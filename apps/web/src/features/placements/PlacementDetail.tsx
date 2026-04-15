import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { SubmissionTarget } from '@marketmosaic/shared';

interface PlacementDetailProps {
  target: SubmissionTarget;
}

const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
  </div>
);

export const PlacementDetail: React.FC<PlacementDetailProps> = ({ target }) => (
  <div className="space-y-6">
    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Target Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Submission ID" value={target.submission_id} />
        <DetailField label="Carrier" value={target.carrier_id} />
        <DetailField label="Contact" value={target.contact_id} />
        <DetailField label="Line of Business" value={target.line_of_business_id} />
        <DetailField
          label="Status"
          value={<StatusBadge status={target.status} />}
        />
        <DetailField label="Sent" value={formatDate(target.sent_at)} />
        <DetailField label="Response Due" value={formatDate(target.response_due)} />
      </div>
    </Card>

    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Quoted Terms
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <DetailField
          label="Premium"
          value={formatCurrency(target.quoted_premium)}
        />
        <DetailField
          label="Limit"
          value={formatCurrency(target.quoted_limit)}
        />
        <DetailField
          label="Deductible"
          value={formatCurrency(target.quoted_deductible)}
        />
        {target.decline_reason && (
          <DetailField
            label="Decline Reason"
            value={
              <Badge variant="danger">{target.decline_reason}</Badge>
            }
          />
        )}
      </div>
    </Card>

    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Timeline</h3>
      <div className="space-y-3">
        <DetailField label="Created" value={formatDate(target.created_at)} />
        <DetailField label="Updated" value={formatDate(target.updated_at)} />
        {target.sent_at && (
          <DetailField label="Sent At" value={formatDate(target.sent_at)} />
        )}
      </div>
    </Card>

    {target.notes && (
      <Card padding="lg">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Notes</h3>
        <p className="text-sm text-gray-600">{target.notes}</p>
      </Card>
    )}
  </div>
);
