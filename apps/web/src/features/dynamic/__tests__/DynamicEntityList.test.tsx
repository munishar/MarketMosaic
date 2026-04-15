import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { EntityDefinition, FieldSchema, PermissionMatrixConfig, NavigationConfig, WorkflowDefinition } from '@brokerflow/manifest';
import { DynamicEntityList } from '../DynamicEntityList';

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      auth: { user: { id: '1', role: 'admin', email: 'a@b.com', first_name: 'A', last_name: 'B' } },
    }),
  ),
}));

const mockEntities: EntityDefinition[] = [
  {
    key: 'client',
    name: 'Client',
    plural_name: 'Clients',
    table_name: 'clients',
    icon: 'Building2',
    primary_field: 'company_name',
    search_fields: ['company_name'],
    default_sort: { field: 'company_name', order: 'asc' },
    features: { soft_delete: true, audit_log: true, activity_feed: true, attachments: true },
  },
];

const mockFields: FieldSchema[] = [
  {
    key: 'client.company_name',
    entity_key: 'client',
    field_name: 'company_name',
    field_type: 'text',
    label: 'Company Name',
    required: true,
    show_in_list: true,
    show_in_detail: true,
    show_in_form: true,
    sortable: true,
    filterable: true,
    searchable: true,
    display_order: 1,
    column_width: '200px',
  },
  {
    key: 'client.status',
    entity_key: 'client',
    field_name: 'status',
    field_type: 'enum',
    label: 'Status',
    required: true,
    show_in_list: true,
    show_in_detail: true,
    show_in_form: true,
    sortable: true,
    filterable: true,
    searchable: false,
    enum_values: ['prospect', 'active', 'inactive', 'lost'],
    default_value: 'prospect',
    display_order: 2,
    column_width: '100px',
  },
  {
    key: 'client.dba',
    entity_key: 'client',
    field_name: 'dba',
    field_type: 'text',
    label: 'DBA',
    required: false,
    show_in_list: false,
    show_in_detail: true,
    show_in_form: true,
    sortable: false,
    filterable: false,
    searchable: true,
    display_order: 3,
  },
];

const mockPermissions: PermissionMatrixConfig[] = [
  {
    key: 'client_permissions',
    entity_key: 'client',
    role_permissions: {
      admin: { create: true, read: true, update: true, delete: true },
      viewer: { create: false, read: true, update: false, delete: false },
    },
  },
];

const mockNavigation: NavigationConfig = { items: [] };
const mockWorkflows: WorkflowDefinition[] = [];

const overrides = {
  entities: mockEntities,
  fields: mockFields,
  workflows: mockWorkflows,
  navigation: mockNavigation,
  permissions: mockPermissions,
};

const mockData = [
  { id: '1', company_name: 'Acme Corp', status: 'active', dba: 'Acme' },
  { id: '2', company_name: 'Widgets Inc', status: 'prospect', dba: null },
];

describe('DynamicEntityList', () => {
  it('renders columns matching list field schemas (show_in_list=true)', () => {
    render(
      <DynamicEntityList
        entityKey="client"
        data={mockData}
        overrides={overrides}
      />,
    );

    // Column headers should match fields with show_in_list=true
    expect(screen.getByText('Company Name')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();

    // DBA has show_in_list=false, should NOT appear as column header
    expect(screen.queryByText('DBA')).toBeNull();
  });

  it('renders entity plural name as heading', () => {
    render(
      <DynamicEntityList
        entityKey="client"
        data={mockData}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Clients')).toBeDefined();
  });

  it('renders data rows', () => {
    render(
      <DynamicEntityList
        entityKey="client"
        data={mockData}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Acme Corp')).toBeDefined();
    expect(screen.getByText('Widgets Inc')).toBeDefined();
  });

  it('renders enum values formatted', () => {
    render(
      <DynamicEntityList
        entityKey="client"
        data={mockData}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Prospect')).toBeDefined();
  });

  it('shows create button for admin role', () => {
    const onCreate = vi.fn();
    render(
      <DynamicEntityList
        entityKey="client"
        data={mockData}
        onCreateClick={onCreate}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Add Client')).toBeDefined();
  });

  it('shows empty message when no data', () => {
    render(
      <DynamicEntityList
        entityKey="client"
        data={[]}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('No clients found')).toBeDefined();
  });

  it('renders not found for unknown entity', () => {
    render(
      <DynamicEntityList
        entityKey="unknown"
        data={[]}
        overrides={overrides}
      />,
    );

    expect(screen.getByText(/not found/i)).toBeDefined();
  });
});
