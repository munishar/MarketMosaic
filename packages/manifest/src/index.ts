// Schema types
export type {
  EntityDefinition,
} from './schema/entity-definition';
export type {
  FieldSchema,
} from './schema/field-schema';
export type {
  WorkflowDefinition,
  WorkflowStage,
} from './schema/workflow-definition';
export type {
  UILayout,
  UISection,
} from './schema/ui-layout';
export type {
  PermissionMatrixConfig,
} from './schema/permission-matrix';
export type {
  NavigationConfig,
  NavigationItem,
} from './schema/navigation';
export type {
  BusinessRule,
  RuleCondition,
  RuleAction,
} from './schema/business-rule';

// Validation
export {
  validateManifest,
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
} from './validation';
export type { ManifestValidationResult } from './validation';

// Defaults
import defaultEntities from './defaults/entities.json';
import defaultFields from './defaults/fields.json';
import defaultWorkflows from './defaults/workflows.json';
import defaultNavigation from './defaults/navigation.json';
import defaultPermissions from './defaults/permissions.json';

export {
  defaultEntities,
  defaultFields,
  defaultWorkflows,
  defaultNavigation,
  defaultPermissions,
};
