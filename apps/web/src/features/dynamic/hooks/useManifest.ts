import { useMemo } from 'react';
import type {
  EntityDefinition,
  FieldSchema,
  WorkflowDefinition,
  NavigationConfig,
  PermissionMatrixConfig,
} from '@brokerflow/manifest';
import {
  defaultEntities,
  defaultFields,
  defaultWorkflows,
  defaultNavigation,
  defaultPermissions,
} from '@brokerflow/manifest';

export interface ManifestOverrides {
  entities?: EntityDefinition[];
  fields?: FieldSchema[];
  workflows?: WorkflowDefinition[];
  navigation?: NavigationConfig;
  permissions?: PermissionMatrixConfig[];
}

export interface ManifestData {
  entities: EntityDefinition[];
  fields: FieldSchema[];
  workflows: WorkflowDefinition[];
  navigation: NavigationConfig;
  permissions: PermissionMatrixConfig[];
}

/**
 * Fetch and cache manifest configs using defaults from @brokerflow/manifest.
 * Accepts optional overrides to merge with defaults.
 */
export function useManifest(overrides?: ManifestOverrides): ManifestData {
  return useMemo(() => {
    const entities = (overrides?.entities ?? defaultEntities) as EntityDefinition[];
    const fields = (overrides?.fields ?? defaultFields) as FieldSchema[];
    const workflows = (overrides?.workflows ?? defaultWorkflows) as WorkflowDefinition[];
    const navigation = (overrides?.navigation ?? defaultNavigation) as NavigationConfig;
    const permissions = (overrides?.permissions ?? defaultPermissions) as PermissionMatrixConfig[];

    return { entities, fields, workflows, navigation, permissions };
  }, [overrides]);
}
