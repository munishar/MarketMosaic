import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamService from '../team.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

const makeTeam = (overrides = {}) => ({
  id: 't1', name: 'Alpha Team', region: 'northeast', manager_id: 'u1', ...overrides,
});

describe('TeamService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated team list with manager names joined', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            makeTeam({ manager_first_name: 'John', manager_last_name: 'Doe' }),
            makeTeam({ id: 't2', name: 'Beta Team' }),
          ],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await teamService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('manager_first_name');
      expect(result.meta.total).toBe(2);
    });

    it('filters by region', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeTeam()], command: '', rowCount: 1, oid: 0, fields: [] });

      await teamService.list({ region: 'northeast' });
      expect(mockQuery.mock.calls[0][1]).toContain('northeast');
    });
  });

  describe('getById', () => {
    it('returns team when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTeam()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await teamService.getById('t1');
      expect(result.name).toBe('Alpha Team');
    });

    it('throws 404 when team not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(teamService.getById('nope')).rejects.toThrow('Team not found');
    });
  });

  describe('getMembers', () => {
    it('returns members for a team', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeTeam()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // members
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'u1', first_name: 'Alice', last_name: 'Smith', role: 'servicer' },
          { id: 'u2', first_name: 'Bob', last_name: 'Jones', role: 'servicer' },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await teamService.getMembers('t1', {});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('throws 404 if team does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(teamService.getMembers('nope', {})).rejects.toThrow('Team not found');
    });
  });

  describe('create', () => {
    it('creates and returns a team', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTeam()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await teamService.create({ name: 'Alpha Team', region: 'northeast' }, 'admin1');
      expect(result.name).toBe('Alpha Team');
    });
  });

  describe('update', () => {
    it('updates and returns team', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTeam({ name: 'Updated Team' })], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await teamService.update('t1', { name: 'Updated Team' }, 'admin1');
      expect(result.name).toBe('Updated Team');
    });

    it('throws 404 when team not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(teamService.update('nope', { name: 'X' }, 'admin1')).rejects.toThrow('Team not found');
    });
  });

  describe('remove', () => {
    it('deletes team', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 't1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      await expect(teamService.remove('t1')).resolves.toBeUndefined();
    });

    it('throws 404 when team not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(teamService.remove('nope')).rejects.toThrow('Team not found');
    });
  });
});
