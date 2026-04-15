import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const CapacityPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Capacity Matrix"
        description="View and manage underwriter capacity."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Capacity Matrix feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default CapacityPage;
