import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const EmailPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Email"
        description="Manage email communications."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Email feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default EmailPage;
