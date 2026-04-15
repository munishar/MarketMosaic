import { describe, it, expect } from 'vitest';
import { ManifestType } from '@marketmosaic/shared';
import { validateManifest } from './manifest-validator';

describe('validateManifest', () => {
  describe('entity_definition', () => {
    const validEntity = {
      key: 'client',
      name: 'Client',
      plural_name: 'Clients',
      table_name: 'clients',
      icon: 'Building2',
      primary_field: 'company_name',
      search_fields: ['company_name', 'dba'],
      default_sort: { field: 'company_name', order: 'asc' },
      features: { soft_delete: true, audit_log: true, activity_feed: true, attachments: true },
    };

    it('validates a correct entity definition', () => {
      const result = validateManifest(ManifestType.entity_definition, validEntity);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validEntity);
    });

    it('rejects missing required fields', () => {
      const result = validateManifest(ManifestType.entity_definition, { key: 'x' });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('rejects invalid sort order', () => {
      const result = validateManifest(ManifestType.entity_definition, {
        ...validEntity,
        default_sort: { field: 'name', order: 'invalid' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('field_schema', () => {
    const validField = {
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
    };

    it('validates a correct field schema', () => {
      const result = validateManifest(ManifestType.field_schema, validField);
      expect(result.success).toBe(true);
    });

    it('validates field with optional properties', () => {
      const result = validateManifest(ManifestType.field_schema, {
        ...validField,
        enum_values: ['a', 'b'],
        reference_entity: 'user',
        default_value: 'test',
        validation_rules: { min_length: 1, max_length: 255 },
        column_width: '200px',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid field_type', () => {
      const result = validateManifest(ManifestType.field_schema, {
        ...validField,
        field_type: 'invalid_type',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('workflow_definition', () => {
    const validWorkflow = {
      key: 'submission_workflow',
      name: 'Submission Workflow',
      entity_key: 'submission',
      status_field: 'status',
      stages: [
        { key: 'draft', name: 'Draft', color: '#6B7280', order: 1, allowed_transitions: ['submitted'] },
        { key: 'submitted', name: 'Submitted', color: '#2E75B6', order: 2, allowed_transitions: [] },
      ],
    };

    it('validates a correct workflow definition', () => {
      const result = validateManifest(ManifestType.workflow_definition, validWorkflow);
      expect(result.success).toBe(true);
    });

    it('validates workflow with auto_actions', () => {
      const withActions = {
        ...validWorkflow,
        stages: [
          {
            key: 'draft',
            name: 'Draft',
            color: '#6B7280',
            order: 1,
            allowed_transitions: ['submitted'],
            auto_actions: [{ event: 'on_enter', action: 'create_activity', params: { type: 'created' } }],
          },
        ],
      };
      const result = validateManifest(ManifestType.workflow_definition, withActions);
      expect(result.success).toBe(true);
    });

    it('rejects workflow with no stages', () => {
      const result = validateManifest(ManifestType.workflow_definition, {
        ...validWorkflow,
        stages: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ui_layout', () => {
    const validLayout = {
      key: 'client_list',
      entity_key: 'client',
      layout_type: 'list_view',
      sections: [{ title: 'Main', columns: 2, fields: ['company_name', 'status'] }],
    };

    it('validates a correct UI layout', () => {
      const result = validateManifest(ManifestType.ui_layout, validLayout);
      expect(result.success).toBe(true);
    });

    it('rejects invalid layout_type', () => {
      const result = validateManifest(ManifestType.ui_layout, {
        ...validLayout,
        layout_type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects layout with no sections', () => {
      const result = validateManifest(ManifestType.ui_layout, {
        ...validLayout,
        sections: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('permission_matrix', () => {
    const validPermission = {
      key: 'client_permissions',
      entity_key: 'client',
      role_permissions: {
        admin: { create: true, read: true, update: true, delete: true },
        viewer: { create: false, read: true, update: false, delete: false },
      },
    };

    it('validates a correct permission matrix', () => {
      const result = validateManifest(ManifestType.permission_matrix, validPermission);
      expect(result.success).toBe(true);
    });

    it('validates permission with row_filter', () => {
      const result = validateManifest(ManifestType.permission_matrix, {
        ...validPermission,
        role_permissions: {
          ...validPermission.role_permissions,
          servicer: { create: true, read: true, update: true, delete: false, row_filter: 'own' },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('navigation', () => {
    const validNav = {
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'Home', path: '/', order: 1 },
        { key: 'clients', label: 'Clients', icon: 'Building', path: '/clients', order: 2, badge_source: 'count' },
      ],
    };

    it('validates a correct navigation config', () => {
      const result = validateManifest(ManifestType.navigation, validNav);
      expect(result.success).toBe(true);
    });

    it('validates nav items with optional properties', () => {
      const result = validateManifest(ManifestType.navigation, {
        items: [
          { key: 'admin', label: 'Admin', icon: 'Settings', path: '/admin', order: 10, parent_key: 'settings', roles: ['admin'] },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty items array', () => {
      const result = validateManifest(ManifestType.navigation, { items: [] });
      expect(result.success).toBe(false);
    });
  });

  describe('business_rule', () => {
    const validRule = {
      key: 'auto_notify_on_quote',
      name: 'Auto notify on quote',
      entity_key: 'submission_target',
      trigger: 'on_status_change',
      conditions: [{ field: 'status', operator: 'equals', value: 'quoted' }],
      actions: [{ type: 'create_notification', params: { title: 'Quote received' } }],
      is_active: true,
    };

    it('validates a correct business rule', () => {
      const result = validateManifest(ManifestType.business_rule, validRule);
      expect(result.success).toBe(true);
    });

    it('rejects invalid trigger type', () => {
      const result = validateManifest(ManifestType.business_rule, {
        ...validRule,
        trigger: 'invalid_trigger',
      });
      expect(result.success).toBe(false);
    });

    it('rejects rule with no actions', () => {
      const result = validateManifest(ManifestType.business_rule, {
        ...validRule,
        actions: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid operator in conditions', () => {
      const result = validateManifest(ManifestType.business_rule, {
        ...validRule,
        conditions: [{ field: 'status', operator: 'invalid_op', value: 'x' }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('unknown manifest type', () => {
    it('returns error for unknown manifest type', () => {
      const result = validateManifest('unknown_type' as ManifestType, {});
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('Unknown manifest type');
    });
  });
});
