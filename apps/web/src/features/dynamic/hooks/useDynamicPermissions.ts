import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { useManifest, type ManifestOverrides } from './useManifest';

export interface DynamicPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  rowFilter?: string;
}

/**
 * Given entityKey and current user role, return computed CRUD permissions.
 */
export function useDynamicPermissions(
  entityKey: string,
  overrides?: ManifestOverrides,
): DynamicPermissions {
  const user = useAppStore((state) => state.auth.user);
  const { permissions } = useManifest(overrides);

  return useMemo(() => {
    const role = user?.role ?? 'viewer';
    const matrix = permissions.find((p) => p.entity_key === entityKey);

    if (!matrix) {
      return { canCreate: false, canRead: true, canUpdate: false, canDelete: false };
    }

    const rolePerms = matrix.role_permissions[role];
    if (!rolePerms) {
      return { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    }

    return {
      canCreate: rolePerms.create,
      canRead: rolePerms.read,
      canUpdate: rolePerms.update,
      canDelete: rolePerms.delete,
      rowFilter: rolePerms.row_filter,
    };
  }, [user, permissions, entityKey]);
}
