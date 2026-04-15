import { describe, it, expect } from 'vitest';
import { checkPermission, getRowFilter, buildRowFilterClause } from '../permissions';
import { UserRole } from '@marketmosaic/shared';

describe('Permissions utilities', () => {
  describe('checkPermission', () => {
    it('should allow admin full CRUD on all entities', () => {
      expect(checkPermission(UserRole.admin, 'client', 'create')).toBe(true);
      expect(checkPermission(UserRole.admin, 'client', 'read')).toBe(true);
      expect(checkPermission(UserRole.admin, 'client', 'update')).toBe(true);
      expect(checkPermission(UserRole.admin, 'client', 'delete')).toBe(true);
      expect(checkPermission(UserRole.admin, 'user', 'delete')).toBe(true);
    });

    it('should deny manager delete on all entities', () => {
      expect(checkPermission(UserRole.manager, 'client', 'create')).toBe(true);
      expect(checkPermission(UserRole.manager, 'client', 'read')).toBe(true);
      expect(checkPermission(UserRole.manager, 'client', 'update')).toBe(true);
      expect(checkPermission(UserRole.manager, 'client', 'delete')).toBe(false);
    });

    it('should give manager read-only on user/team entities', () => {
      expect(checkPermission(UserRole.manager, 'user', 'create')).toBe(false);
      expect(checkPermission(UserRole.manager, 'user', 'read')).toBe(true);
      expect(checkPermission(UserRole.manager, 'user', 'update')).toBe(false);
      expect(checkPermission(UserRole.manager, 'user', 'delete')).toBe(false);
    });

    it('should allow servicer team-scoped CRUD on client', () => {
      expect(checkPermission(UserRole.servicer, 'client', 'create')).toBe(true);
      expect(checkPermission(UserRole.servicer, 'client', 'read')).toBe(true);
      expect(checkPermission(UserRole.servicer, 'client', 'update')).toBe(true);
      expect(checkPermission(UserRole.servicer, 'client', 'delete')).toBe(false);
    });

    it('should give servicer read-only on carrier', () => {
      expect(checkPermission(UserRole.servicer, 'carrier', 'create')).toBe(false);
      expect(checkPermission(UserRole.servicer, 'carrier', 'read')).toBe(true);
      expect(checkPermission(UserRole.servicer, 'carrier', 'update')).toBe(false);
    });

    it('should give viewer read-only everywhere', () => {
      expect(checkPermission(UserRole.viewer, 'client', 'create')).toBe(false);
      expect(checkPermission(UserRole.viewer, 'client', 'read')).toBe(true);
      expect(checkPermission(UserRole.viewer, 'client', 'update')).toBe(false);
      expect(checkPermission(UserRole.viewer, 'client', 'delete')).toBe(false);
    });

    it('should return false for unknown entity', () => {
      expect(checkPermission(UserRole.admin, 'nonexistent', 'read')).toBe(false);
    });
  });

  describe('getRowFilter', () => {
    it('should return undefined for admin', () => {
      expect(getRowFilter(UserRole.admin, 'client')).toBeUndefined();
    });

    it('should return undefined for manager', () => {
      expect(getRowFilter(UserRole.manager, 'client')).toBeUndefined();
    });

    it('should return "team" for servicer on client', () => {
      expect(getRowFilter(UserRole.servicer, 'client')).toBe('team');
    });

    it('should return "own" for servicer on submission', () => {
      expect(getRowFilter(UserRole.servicer, 'submission')).toBe('own');
    });

    it('should return undefined for viewer', () => {
      expect(getRowFilter(UserRole.viewer, 'client')).toBeUndefined();
    });

    it('should return undefined for unknown entity', () => {
      expect(getRowFilter(UserRole.admin, 'nonexistent')).toBeUndefined();
    });
  });

  describe('buildRowFilterClause', () => {
    it('should build own filter clause', () => {
      const clause = buildRowFilterClause('own', 'user-123');
      expect(clause).toBe("created_by = 'user-123'");
    });

    it('should build team filter clause with team_id', () => {
      const clause = buildRowFilterClause('team', 'user-123', 'team-456');
      expect(clause).toBe("assigned_team_id = 'team-456'");
    });

    it('should fall back to created_by for team filter without team_id', () => {
      const clause = buildRowFilterClause('team', 'user-123');
      expect(clause).toBe("created_by = 'user-123'");
    });

    it('should return 1=1 for unknown filter type', () => {
      const clause = buildRowFilterClause('all', 'user-123');
      expect(clause).toBe('1=1');
    });
  });
});
