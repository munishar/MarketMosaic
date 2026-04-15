import React from 'react';
import { Building2, Users, FileText, Layers } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Carrier } from '@brokerflow/shared';

interface CarrierDetailProps {
  carrier: Carrier;
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

function getRatingVariant(
  rating: string | null,
): 'success' | 'warning' | 'danger' | 'default' {
  if (!rating) return 'default';
  const upper = rating.toUpperCase();
  if (upper.startsWith('A+') || upper.startsWith('A ') || upper === 'A')
    return 'success';
  if (upper.startsWith('A-') || upper.startsWith('B+')) return 'warning';
  return 'danger';
}

const ProfileTab: React.FC<{ carrier: Carrier }> = ({ carrier }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Carrier Info</h3>
      <div className="space-y-4">
        <DetailField label="Name" value={carrier.name} />
        <DetailField
          label="Type"
          value={carrier.type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        />
        <DetailField
          label="AM Best Rating"
          value={
            carrier.am_best_rating ? (
              <Badge variant={getRatingVariant(carrier.am_best_rating)}>
                {carrier.am_best_rating}
              </Badge>
            ) : null
          }
        />
        <DetailField
          label="Appointed"
          value={
            <Badge variant={carrier.appointed ? 'success' : 'default'}>
              {carrier.appointed ? 'Yes' : 'No'}
            </Badge>
          }
        />
        <DetailField label="Appointment Date" value={formatDate(carrier.appointment_date)} />
        <DetailField label="HQ State" value={carrier.headquarters_state} />
        <DetailField
          label="Website"
          value={
            carrier.website ? (
              <a
                href={carrier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                {carrier.website}
              </a>
            ) : null
          }
        />
      </div>
    </Card>
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
      <div className="space-y-4">
        <DetailField
          label="Available States"
          value={
            carrier.available_states.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {carrier.available_states.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : null
          }
        />
        <DetailField label="Notes" value={carrier.notes} />
        <DetailField label="Created" value={formatDate(carrier.created_at)} />
        <DetailField label="Updated" value={formatDate(carrier.updated_at)} />
      </div>
    </Card>
  </div>
);

const PlaceholderTab: React.FC<{ message: string }> = ({ message }) => (
  <Card padding="lg">
    <div className="text-center py-8 text-sm text-gray-500">{message}</div>
  </Card>
);

export const CarrierDetail: React.FC<CarrierDetailProps> = ({ carrier }) => {
  const tabs: TabItem[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <Building2 className="h-4 w-4" />,
      content: <ProfileTab carrier={carrier} />,
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: <Users className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Contacts associated with this carrier will be shown here." />
      ),
    },
    {
      key: 'lines',
      label: 'Lines',
      icon: <Layers className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Lines of business offered by this carrier will appear here." />
      ),
    },
    {
      key: 'forms',
      label: 'Forms',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Forms and papers for this carrier will appear here." />
      ),
    },
  ];

  return <Tabs items={tabs} defaultActiveKey="profile" />;
};
