import React, { useEffect, useState } from 'react';
import { FileText, Target, Clock } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useSubmissions } from './hooks/useSubmissions';
import type { Submission, SubmissionTarget } from '@marketmosaic/shared';

interface SubmissionDetailProps {
  submission: Submission;
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

const OverviewTab: React.FC<{ submission: Submission }> = ({ submission }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Submission Info
      </h3>
      <div className="space-y-4">
        <DetailField label="Client ID" value={submission.client_id} />
        <DetailField
          label="Status"
          value={<StatusBadge status={submission.status} />}
        />
        <DetailField
          label="Priority"
          value={<StatusBadge status={submission.priority} />}
        />
        <DetailField
          label="Effective Date"
          value={formatDate(submission.effective_date)}
        />
        <DetailField
          label="Expiration Date"
          value={formatDate(submission.expiration_date)}
        />
        <DetailField
          label="Submission Date"
          value={formatDate(submission.submission_date)}
        />
      </div>
    </Card>
    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Lines Requested
      </h3>
      {submission.lines_requested.length === 0 ? (
        <p className="text-sm text-gray-500">No lines specified.</p>
      ) : (
        <div className="space-y-2">
          {submission.lines_requested.map((line, idx) => (
            <div
              key={line.line_of_business_id ?? idx}
              className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
            >
              <span className="text-sm font-medium">
                {line.line_of_business_id}
              </span>
              <span className="text-sm text-gray-500">
                {line.requested_limit
                  ? `$${parseInt(String(line.requested_limit), 10).toLocaleString()}`
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-4 mt-6 text-sm font-semibold text-gray-900">
        Details
      </h3>
      <div className="space-y-4">
        <DetailField
          label="Renewal Of"
          value={
            submission.renewal_of ? (
              <Badge variant="secondary">{submission.renewal_of}</Badge>
            ) : (
              '—'
            )
          }
        />
        <DetailField label="Notes" value={submission.notes} />
        <DetailField
          label="Created"
          value={formatDate(submission.created_at)}
        />
        <DetailField
          label="Updated"
          value={formatDate(submission.updated_at)}
        />
      </div>
    </Card>
  </div>
);

const TargetsTab: React.FC<{ submissionId: string }> = ({ submissionId }) => {
  const { fetchTargets } = useSubmissions();
  const [targets, setTargets] = useState<SubmissionTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchTargets(submissionId);
        setTargets(Array.isArray(data) ? (data as SubmissionTarget[]) : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId, fetchTargets]);

  const columns: Column<SubmissionTarget>[] = [
    { key: 'carrier_id', header: 'Carrier', sortable: true },
    { key: 'contact_id', header: 'Contact', sortable: true },
    { key: 'line_of_business_id', header: 'Line' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: 'quoted_premium',
      header: 'Premium',
      render: (value) => formatCurrency(value as number | null),
    },
    {
      key: 'quoted_limit',
      header: 'Limit',
      render: (value) => formatCurrency(value as number | null),
    },
    {
      key: 'sent_at',
      header: 'Sent',
      render: (value) => formatDate(value as string | null),
    },
    {
      key: 'response_due',
      header: 'Due',
      render: (value) => formatDate(value as string | null),
    },
  ];

  return (
    <DataTable<SubmissionTarget>
      columns={columns}
      data={targets}
      isLoading={loading}
      emptyMessage="No targets for this submission."
      rowKey={(row) => row.id}
    />
  );
};

const ActivityTab: React.FC = () => (
  <Card padding="lg">
    <div className="py-8 text-center text-sm text-gray-500">
      Activity log for this submission will appear here.
    </div>
  </Card>
);

export const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
  submission,
}) => {
  const tabs: TabItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <FileText className="h-4 w-4" />,
      content: <OverviewTab submission={submission} />,
    },
    {
      key: 'targets',
      label: 'Targets',
      icon: <Target className="h-4 w-4" />,
      content: <TargetsTab submissionId={submission.id} />,
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: <Clock className="h-4 w-4" />,
      content: <ActivityTab />,
    },
  ];

  return <Tabs items={tabs} defaultActiveKey="overview" />;
};
