import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const LinesPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Lines of Business"
        description="Manage lines of business."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Lines of Business feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default LinesPage;
