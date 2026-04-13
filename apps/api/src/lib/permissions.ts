import { UserRole, DEFAULT_PERMISSIONS } from '@brokerflow/shared';

export type CrudAction = 'create' | 'read' | 'update' | 'delete';

export function checkPermission(role: UserRole, entity: string, action: CrudAction): boolean {
  const rolePerms = DEFAULT_PERMISSIONS[role];
  if (!rolePerms) return false;
  const entityPerms = rolePerms[entity];
  if (!entityPerms) return false;
  return entityPerms[action] === true;
}

export function getRowFilter(role: UserRole, entity: string): string | undefined {
  const rolePerms = DEFAULT_PERMISSIONS[role];
  if (!rolePerms) return undefined;
  const entityPerms = rolePerms[entity];
  if (!entityPerms) return undefined;
  return entityPerms.row_filter;
}

// Simplified row filter clause builder. In production, use parameterized queries.
export function buildRowFilterClause(filter: string, userId: string, teamId?: string): string {
  switch (filter) {
    case 'own':
      return `created_by = '${userId}'`;
    case 'team':
      return teamId ? `assigned_team_id = '${teamId}'` : `created_by = '${userId}'`;
    default:
      return '1=1';
  }
}
