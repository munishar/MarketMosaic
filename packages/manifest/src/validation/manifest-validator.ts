import { z } from 'zod';
import { ManifestType } from '@brokerflow/shared';

// --- Entity Definition Schema ---

const entityDefinitionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  plural_name: z.string().min(1),
  table_name: z.string().min(1),
  icon: z.string().min(1),
  primary_field: z.string().min(1),
  search_fields: z.array(z.string()),
  default_sort: z.object({
    field: z.string().min(1),
    order: z.enum(['asc', 'desc']),
  }),
  features: z.object({
    soft_delete: z.boolean(),
    audit_log: z.boolean(),
    activity_feed: z.boolean(),
    attachments: z.boolean(),
  }),
});

// --- Field Schema ---

const fieldSchemaSchema = z.object({
  key: z.string().min(1),
  entity_key: z.string().min(1),
  field_name: z.string().min(1),
  field_type: z.enum([
    'text',
    'number',
    'decimal',
    'boolean',
    'date',
    'datetime',
    'enum',
    'reference',
    'array',
    'json',
    'rich_text',
    'email',
    'phone',
    'url',
    'address',
  ]),
  label: z.string().min(1),
  required: z.boolean(),
  show_in_list: z.boolean(),
  show_in_detail: z.boolean(),
  show_in_form: z.boolean(),
  sortable: z.boolean(),
  filterable: z.boolean(),
  searchable: z.boolean(),
  enum_values: z.array(z.string()).optional(),
  reference_entity: z.string().optional(),
  default_value: z.unknown().optional(),
  validation_rules: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      min_length: z.number().optional(),
      max_length: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  display_order: z.number().int().min(0),
  column_width: z.string().optional(),
});

// --- Workflow Definition Schema ---

const workflowStageSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  order: z.number().int().min(0),
  allowed_transitions: z.array(z.string()),
  auto_actions: z
    .array(
      z.object({
        event: z.string().min(1),
        action: z.string().min(1),
        params: z.record(z.unknown()),
      })
    )
    .optional(),
});

const workflowDefinitionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  entity_key: z.string().min(1),
  status_field: z.string().min(1),
  stages: z.array(workflowStageSchema).min(1),
});

// --- UI Layout Schema ---

const uiSectionSchema = z.object({
  title: z.string().min(1),
  columns: z.number().int().min(1).max(4),
  fields: z.array(z.string()),
  collapsed: z.boolean().optional(),
});

const uiLayoutSchema = z.object({
  key: z.string().min(1),
  entity_key: z.string().min(1),
  layout_type: z.enum(['list_view', 'detail_view', 'create_form', 'edit_form']),
  sections: z.array(uiSectionSchema).min(1),
});

// --- Permission Matrix Schema ---

const rolePermissionSchema = z.object({
  create: z.boolean(),
  read: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
  row_filter: z.string().optional(),
});

const permissionMatrixSchema = z.object({
  key: z.string().min(1),
  entity_key: z.string().min(1),
  role_permissions: z.record(rolePermissionSchema),
});

// --- Navigation Schema ---

const navigationItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  path: z.string().min(1),
  order: z.number().int().min(0),
  parent_key: z.string().optional(),
  roles: z.array(z.string()).optional(),
  badge_source: z.string().optional(),
});

const navigationConfigSchema = z.object({
  items: z.array(navigationItemSchema).min(1),
});

// --- Business Rule Schema ---

const ruleConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum([
    'equals',
    'not_equals',
    'contains',
    'greater_than',
    'less_than',
    'in',
    'not_in',
  ]),
  value: z.unknown(),
});

const ruleActionSchema = z.object({
  type: z.enum([
    'set_field',
    'create_notification',
    'send_email',
    'create_activity',
    'trigger_workflow',
  ]),
  params: z.record(z.unknown()),
});

const businessRuleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  entity_key: z.string().min(1),
  trigger: z.enum(['on_create', 'on_update', 'on_status_change', 'on_schedule']),
  conditions: z.array(ruleConditionSchema),
  actions: z.array(ruleActionSchema).min(1),
  is_active: z.boolean(),
});

// --- Schema Map ---

const schemaMap: Record<string, z.ZodType> = {
  [ManifestType.entity_definition]: entityDefinitionSchema,
  [ManifestType.field_schema]: fieldSchemaSchema,
  [ManifestType.workflow_definition]: workflowDefinitionSchema,
  [ManifestType.ui_layout]: uiLayoutSchema,
  [ManifestType.permission_matrix]: permissionMatrixSchema,
  [ManifestType.navigation]: navigationConfigSchema,
  [ManifestType.business_rule]: businessRuleSchema,
};

// --- Exports ---

export {
  entityDefinitionSchema,
  fieldSchemaSchema,
  workflowDefinitionSchema,
  workflowStageSchema,
  uiLayoutSchema,
  uiSectionSchema,
  permissionMatrixSchema,
  rolePermissionSchema,
  navigationConfigSchema,
  navigationItemSchema,
  businessRuleSchema,
  ruleConditionSchema,
  ruleActionSchema,
};

export interface ManifestValidationResult {
  success: boolean;
  data?: unknown;
  errors?: z.ZodError['errors'];
}

export function validateManifest(
  type: ManifestType,
  config: unknown
): ManifestValidationResult {
  const schema = schemaMap[type];
  if (!schema) {
    return {
      success: false,
      errors: [
        {
          code: 'custom',
          path: ['type'],
          message: `Unknown manifest type: ${type}`,
        },
      ],
    };
  }

  const result = schema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.errors };
}
