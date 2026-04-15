import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';

const ContactsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage external contacts and underwriters."
      />
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Contacts feature will be implemented by its dedicated agent.
      </div>
    </div>
  );
};

export default ContactsPage;
