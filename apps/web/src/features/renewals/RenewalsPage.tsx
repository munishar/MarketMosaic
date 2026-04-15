import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const RenewalsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Renewals"
        description="Manage upcoming renewals."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Renewals feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default RenewalsPage;
