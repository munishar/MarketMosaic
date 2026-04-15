import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const ClientsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client accounts."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Clients feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default ClientsPage;
