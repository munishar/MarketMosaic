import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from '../user.service';

vi.mock('@marketmosaic/db', () => ({ query: vi.fn() }));

import { query } from '@marketmosaic/db';
const mockQuery = vi.mocked(query);

const makeRow = (overrides = {}) => ({
  id: 'u1', email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith',
  role: 'servicer', is_active: true, ...overrides,
});

describe('UserService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated list with defaults', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeRow(), makeRow({ id: 'u2', email: 'bob@example.com' })], command: '', rowCount: 2, oid: 0, fields: [] });

      const result = await userService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ page: 1, limit: 25, total: 2, total_pages: 1 });
    });

    it('filters by role', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeRow({ role: 'admin' })], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await userService.list({ role: 'admin' });
      expect(result.data).toHaveLength(1);
      expect(mockQuery.mock.calls[0][1]).toContain('admin');
    });

    it('supports search parameter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeRow()], command: '', rowCount: 1, oid: 0, fields: [] });

      await userService.list({ search: 'Alice' });
      expect(mockQuery.mock.calls[0][1]).toContain('%Alice%');
    });
  });

  describe('getById', () => {
    it('returns user when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeRow()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await userService.getById('u1');
      expect(result.email).toBe('alice@example.com');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(userService.getById('nope')).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('creates user when email is unique', async () => {
      // findByEmail returns nothing
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      // insert
      mockQuery.mockResolvedValueOnce({ rows: [makeRow()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await userService.create({ email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith', role: 'servicer' }, 'admin1');
      expect(result.email).toBe('alice@example.com');
    });

    it('throws 409 when email already exists', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeRow()], command: '', rowCount: 1, oid: 0, fields: [] });
      await expect(userService.create({ email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith', role: 'servicer' }, 'admin1')).rejects.toThrow('email already exists');
    });
  });

  describe('update', () => {
    it('updates and returns user', async () => {
      // email check (no conflict — returns empty)
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      // update
      mockQuery.mockResolvedValueOnce({ rows: [makeRow({ first_name: 'Alicia' })], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await userService.update('u1', { email: 'new@example.com', first_name: 'Alicia' }, 'admin1');
      expect(result.first_name).toBe('Alicia');
    });

    it('throws 404 when user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(userService.update('nope', { first_name: 'X' }, 'admin1')).rejects.toThrow('User not found');
    });
  });

  describe('remove', () => {
    it('soft-deletes user', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'u1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      await expect(userService.remove('u1', 'admin1')).resolves.toBeUndefined();
    });

    it('throws 404 when user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(userService.remove('nope', 'admin1')).rejects.toThrow('User not found');
    });
  });
});
