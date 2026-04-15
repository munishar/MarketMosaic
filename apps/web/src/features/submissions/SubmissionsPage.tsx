import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const SubmissionsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Manage submission packages."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Submissions feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default SubmissionsPage;
