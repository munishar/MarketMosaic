import React from 'react';
import { User, BarChart3, Network, Clock } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Contact } from '@marketmosaic/shared';

interface ContactDetailProps {
  contact: Contact;
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

const ProfileTab: React.FC<{ contact: Contact }> = ({ contact }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Info</h3>
      <div className="space-y-4">
        <DetailField
          label="Name"
          value={`${contact.first_name} ${contact.last_name}`}
        />
        <DetailField label="Email" value={contact.email} />
        <DetailField label="Phone" value={contact.phone} />
        <DetailField label="Mobile" value={contact.mobile} />
        <DetailField label="Title" value={contact.title} />
        <DetailField
          label="Type"
          value={<StatusBadge status={contact.contact_type} />}
        />
        <DetailField label="Region" value={contact.region} />
        <DetailField
          label="Preferred Contact"
          value={contact.preferred_contact_method}
        />
      </div>
    </Card>
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
      <div className="space-y-4">
        <DetailField
          label="Lines of Business"
          value={
            contact.lines_of_business.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {contact.lines_of_business.map((lob) => (
                  <Badge key={lob} variant="outline">
                    {lob}
                  </Badge>
                ))}
              </div>
            ) : null
          }
        />
        <DetailField
          label="Tags"
          value={
            contact.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null
          }
        />
        <DetailField label="Notes" value={contact.notes} />
        <DetailField label="Created" value={formatDate(contact.created_at)} />
        <DetailField label="Updated" value={formatDate(contact.updated_at)} />
      </div>
    </Card>
  </div>
);

const PlaceholderTab: React.FC<{ message: string }> = ({ message }) => (
  <Card padding="lg">
    <div className="text-center py-8 text-sm text-gray-500">{message}</div>
  </Card>
);

export const ContactDetail: React.FC<ContactDetailProps> = ({ contact }) => {
  const tabs: TabItem[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      content: <ProfileTab contact={contact} />,
    },
    {
      key: 'capacity',
      label: 'Capacity',
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Capacity records for this contact will be shown here." />
      ),
    },
    {
      key: 'network',
      label: 'Network',
      icon: <Network className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Network relationships for this contact will appear here." />
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: <Clock className="h-4 w-4" />,
      content: (
        <PlaceholderTab message="Activity log for this contact will appear here." />
      ),
    },
  ];

  return <Tabs items={tabs} defaultActiveKey="profile" />;
};
