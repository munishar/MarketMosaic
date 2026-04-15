import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const CarriersPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Carriers"
        description="Manage insurance carriers."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Carriers feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default CarriersPage;
