import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const NetworkPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Network"
        description="View your relationship network."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Network feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default NetworkPage;
