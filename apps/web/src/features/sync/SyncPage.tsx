import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const SyncPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Sync"
        description="Manage data synchronization."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Sync feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default SyncPage;
