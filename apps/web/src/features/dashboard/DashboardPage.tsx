import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your brokerage operations."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Dashboard feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default DashboardPage;
