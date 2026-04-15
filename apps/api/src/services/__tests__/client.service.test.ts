import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clientService from '../client.service';

vi.mock('@marketmosaic/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));

import { query } from '@marketmosaic/db';
import { eventBus } from '../../lib/event-bus';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);

const makeClient = (overrides = {}) => ({
  id: 'cl1', company_name: 'Acme Corp', status: 'active', is_active: true, ...overrides,
});

describe('ClientService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated client list with joined names', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            makeClient({ servicer_first_name: 'Alice', team_name: 'Alpha' }),
            makeClient({ id: 'cl2', company_name: 'Beta LLC' }),
          ],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await clientService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('servicer_first_name');
      expect(result.data[0]).toHaveProperty('team_name');
    });

    it('filters by status', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });

      await clientService.list({ status: 'active' });
      expect(mockQuery.mock.calls[0][1]).toContain('active');
    });

    it('filters by assigned_servicer_id', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });

      await clientService.list({ assigned_servicer_id: 'u1' });
      expect(mockQuery.mock.calls[0][1]).toContain('u1');
    });

    it('filters by tags array', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeClient({ tags: ['vip'] })], command: '', rowCount: 1, oid: 0, fields: [] });

      await clientService.list({ tags: ['vip'] });
      // tags array should be in query values
      const countCallValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(countCallValues).toContainEqual(['vip']);
    });
  });

  describe('getById', () => {
    it('returns client when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await clientService.getById('cl1');
      expect(result.company_name).toBe('Acme Corp');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(clientService.getById('nope')).rejects.toThrow('Client not found');
    });
  });

  describe('create', () => {
    it('creates client and emits event', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await clientService.create({ company_name: 'Acme Corp' }, 'user1');
      expect(result.company_name).toBe('Acme Corp');
      expect(mockEmit).toHaveBeenCalledWith('client:created', { client_id: 'cl1', created_by: 'user1' });
    });
  });

  describe('update', () => {
    it('updates client and emits event', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeClient({ company_name: 'Updated Corp' })], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await clientService.update('cl1', { company_name: 'Updated Corp' }, 'user1');
      expect(result.company_name).toBe('Updated Corp');
      expect(mockEmit).toHaveBeenCalledWith('client:updated', { client_id: 'cl1', updated_by: 'user1' });
    });

    it('throws 404 when client not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(clientService.update('nope', { company_name: 'X' }, 'user1')).rejects.toThrow('Client not found');
    });
  });

  describe('remove', () => {
    it('soft-deletes client', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'cl1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      await expect(clientService.remove('cl1', 'user1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(clientService.remove('nope', 'user1')).rejects.toThrow('Client not found');
    });
  });

  describe('getSubmissions', () => {
    it('returns submissions for a client', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 's1', client_id: 'cl1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await clientService.getSubmissions('cl1', {});
      expect(result.data).toHaveLength(1);
    });

    it('throws 404 if client not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(clientService.getSubmissions('nope', {})).rejects.toThrow('Client not found');
    });
  });

  describe('getActivities', () => {
    it('returns activities for a client', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '3' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
        command: '', rowCount: 3, oid: 0, fields: [],
      });

      const result = await clientService.getActivities('cl1', {});
      expect(result.data).toHaveLength(3);
    });
  });

  describe('getAttachments', () => {
    it('returns attachments for a client', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeClient()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'att1', file_name: 'policy.pdf' }, { id: 'att2', file_name: 'app.pdf' }],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await clientService.getAttachments('cl1', {});
      expect(result.data).toHaveLength(2);
    });
  });
});
