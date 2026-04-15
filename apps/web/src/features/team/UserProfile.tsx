import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { User } from '@brokerflow/shared';

interface UserProfileProps {
  user: User;
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

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {user.first_name.charAt(0)}
            {user.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <DetailField label="Email" value={user.email} />
          <DetailField label="Phone" value={user.phone} />
          <DetailField
            label="Role"
            value={
              <Badge variant="primary">
                {user.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            }
          />
          <DetailField label="Region" value={user.region} />
        </div>
      </Card>
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
        <div className="space-y-4">
          <DetailField
            label="Specialties"
            value={
              user.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.specialties.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : null
            }
          />
          <DetailField
            label="Status"
            value={
              <Badge variant={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            }
          />
          <DetailField label="Created" value={formatDate(user.created_at)} />
          <DetailField label="Updated" value={formatDate(user.updated_at)} />
        </div>
      </Card>
    </div>
  );
};
