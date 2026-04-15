import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { UserRole } from '@brokerflow/shared';

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canAccessConfig: boolean;
  isAdmin: boolean;
  isManager: boolean;
  hasRole: (role: UserRole) => boolean;
}

export function usePermissions(): Permissions {
  const user = useAppStore((s) => s.auth.user);

  return useMemo(() => {
    const role = user?.role ?? UserRole.viewer;

    const isAdmin = role === UserRole.admin;
    const isManager = role === UserRole.manager;
    const isServicer = role === UserRole.servicer;

    return {
      canCreate: isAdmin || isManager || isServicer,
      canEdit: isAdmin || isManager || isServicer,
      canDelete: isAdmin || isManager,
      canManageTeam: isAdmin || isManager,
      canAccessConfig: isAdmin,
      isAdmin,
      isManager,
      hasRole: (r: UserRole) => role === r,
    };
  }, [user?.role]);
}
