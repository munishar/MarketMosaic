import React from 'react';
import { Building2, FileText, Clock, Send } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Client } from '@marketmosaic/shared';

interface ClientDetailProps {
  client: Client;
}

const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
  </div>
);

const OverviewTab: React.FC<{ client: Client }> = ({ client }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Info</h3>
      <div className="space-y-4">
        <DetailField label="Company Name" value={client.company_name} />
        <DetailField label="DBA" value={client.dba} />
        <DetailField
          label="Status"
          value={<StatusBadge status={client.status} />}
        />
        <DetailField label="Industry" value={client.industry} />
        <DetailField label="NAICS Code" value={client.naics_code} />
        <DetailField label="Revenue" value={formatCurrency(client.revenue)} />
        <DetailField label="Employees" value={client.employee_count?.toLocaleString()} />
        <DetailField
          label="Website"
          value={
            client.website ? (
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                {client.website}
              </a>
            ) : null
          }
        />
      </div>
    </Card>
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Primary Contact</h3>
      <div className="space-y-4">
        <DetailField label="Name" value={client.primary_contact_name} />
        <DetailField label="Email" value={client.primary_contact_email} />
        <DetailField label="Phone" value={client.primary_contact_phone} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-4">Details</h3>
      <div className="space-y-4">
        <DetailField label="Created" value={formatDate(client.created_at)} />
        <DetailField label="Updated" value={formatDate(client.updated_at)} />
        <DetailField label="Notes" value={client.notes} />
      </div>
    </Card>
  </div>
);

const PlaceholderTab: React.FC<{ message: string }> = ({ message }) => (
  <Card padding="lg">
    <div className="text-center py-8 text-sm text-gray-500">{message}</div>
  </Card>
);

export const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {
  const tabs: TabItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: <Building2 className="h-4 w-4" />,
      content: <OverviewTab client={client} />,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      icon: <Send className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Submissions for this client will be displayed here." />
      ),
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Documents attached to this client will appear here." />
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: <Clock className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Activity log for this client will appear here." />
      ),
    },
  ];

  return <Tabs items={tabs} defaultActiveKey="overview" />;
};
