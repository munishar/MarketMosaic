import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { EntityDefinition, FieldSchema, PermissionMatrixConfig, NavigationConfig, WorkflowDefinition } from '@brokerflow/manifest';
import { DynamicEntityForm } from '../DynamicEntityForm';

// Mock the store - admin user by default
const mockUser = { id: '1', role: 'admin', email: 'a@b.com', first_name: 'A', last_name: 'B' };

vi.mock('@/store', () => ({
  useAppStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      auth: { user: mockUser },
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
    validation_rules: { min_length: 1, max_length: 255 },
    display_order: 1,
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
  },
  {
    key: 'client.revenue',
    entity_key: 'client',
    field_name: 'revenue',
    field_type: 'decimal',
    label: 'Revenue',
    required: false,
    show_in_list: true,
    show_in_detail: true,
    show_in_form: true,
    sortable: true,
    filterable: true,
    searchable: false,
    display_order: 3,
  },
  {
    key: 'client.appointed',
    entity_key: 'client',
    field_name: 'appointed',
    field_type: 'boolean',
    label: 'Appointed',
    required: false,
    show_in_list: false,
    show_in_detail: true,
    show_in_form: true,
    sortable: false,
    filterable: false,
    searchable: false,
    display_order: 4,
  },
  {
    key: 'client.hidden_field',
    entity_key: 'client',
    field_name: 'hidden_field',
    field_type: 'text',
    label: 'Hidden Field',
    required: false,
    show_in_list: false,
    show_in_detail: false,
    show_in_form: false,
    sortable: false,
    filterable: false,
    searchable: false,
    display_order: 99,
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

describe('DynamicEntityForm', () => {
  it('renders form fields for fields with show_in_form=true', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    // Fields with show_in_form=true should render
    expect(screen.getByText('Company Name')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Revenue')).toBeDefined();
    expect(screen.getByText('Appointed')).toBeDefined();

    // Hidden Field has show_in_form=false, should NOT render
    expect(screen.queryByText('Hidden Field')).toBeNull();
  });

  it('renders the correct heading for create mode', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('New Client')).toBeDefined();
  });

  it('renders the correct heading for edit mode', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="edit"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Edit Client')).toBeDefined();
  });

  it('populates default values from field schemas', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    // Status default is 'prospect' - the Select shows the label
    expect(screen.getByText('Prospect')).toBeDefined();
  });

  it('renders initial values when provided', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="edit"
        initialValues={{ company_name: 'Acme Corp', status: 'active' }}
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    const nameInput = screen.getByDisplayValue('Acme Corp');
    expect(nameInput).toBeDefined();
  });

  it('shows submit button for admin role', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    expect(screen.getByText('Create Client')).toBeDefined();
  });

  it('renders enum field as dropdown', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    // Enum renders a Select, clicking should open dropdown options
    const statusButton = screen.getByText('Prospect');
    fireEvent.click(statusButton);

    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Inactive')).toBeDefined();
    expect(screen.getByText('Lost')).toBeDefined();
  });

  it('renders not found for unknown entity', () => {
    render(
      <DynamicEntityForm
        entityKey="unknown"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    expect(screen.getByText(/not found/i)).toBeDefined();
  });

  it('renders boolean field as checkbox', () => {
    render(
      <DynamicEntityForm
        entityKey="client"
        mode="create"
        onSubmit={vi.fn()}
        overrides={overrides}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
  });
});
