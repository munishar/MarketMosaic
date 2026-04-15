import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const ConfigPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Config"
        description="Platform configuration and manifests."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Config feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default ConfigPage;
