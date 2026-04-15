import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const PlacementsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Placements"
        description="Track placement lifecycle."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Placements feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default PlacementsPage;
