import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as contactService from '../contact.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));

import { query } from '@brokerflow/db';
import { eventBus } from '../../lib/event-bus';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);

const makeContact = (overrides = {}) => ({
  id: 'ct1', first_name: 'John', last_name: 'Doe', email: 'john@example.com',
  contact_type: 'underwriter', is_active: true, ...overrides,
});

describe('ContactService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated contacts with carrier joined', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            makeContact({ carrier_name: 'Hartford', carrier_type: 'admitted' }),
            makeContact({ id: 'ct2', first_name: 'Jane' }),
          ],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await contactService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('carrier_name');
    });

    it('filters by contact_type', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });

      await contactService.list({ contact_type: 'underwriter' });
      expect(mockQuery.mock.calls[0][1]).toContain('underwriter');
    });

    it('filters by carrier_id', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });

      await contactService.list({ carrier_id: 'car1' });
      expect(mockQuery.mock.calls[0][1]).toContain('car1');
    });

    it('filters by line_of_business using array contains', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });

      await contactService.list({ line_of_business: 'GL' });
      expect(mockQuery.mock.calls[0][1]).toContain('GL');
    });

    it('filters by region', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeContact({ region: 'northeast' })], command: '', rowCount: 1, oid: 0, fields: [] });

      await contactService.list({ region: 'northeast' });
      expect(mockQuery.mock.calls[0][1]).toContain('northeast');
    });
  });

  describe('getById', () => {
    it('returns contact when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await contactService.getById('ct1');
      expect(result.email).toBe('john@example.com');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(contactService.getById('nope')).rejects.toThrow('Contact not found');
    });
  });

  describe('create', () => {
    it('creates contact and emits event', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await contactService.create({ first_name: 'John', last_name: 'Doe', email: 'john@example.com', contact_type: 'underwriter' }, 'user1');
      expect(result.email).toBe('john@example.com');
      expect(mockEmit).toHaveBeenCalledWith('contact:created', { contact_id: 'ct1', created_by: 'user1' });
    });
  });

  describe('update', () => {
    it('updates contact and emits event', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeContact({ first_name: 'Jonathan' })], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await contactService.update('ct1', { first_name: 'Jonathan' }, 'user1');
      expect(result.first_name).toBe('Jonathan');
      expect(mockEmit).toHaveBeenCalledWith('contact:updated', { contact_id: 'ct1', updated_by: 'user1' });
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(contactService.update('nope', { first_name: 'X' }, 'user1')).rejects.toThrow('Contact not found');
    });
  });

  describe('remove', () => {
    it('soft-deletes contact', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'ct1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      await expect(contactService.remove('ct1', 'user1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(contactService.remove('nope', 'user1')).rejects.toThrow('Contact not found');
    });
  });

  describe('getCapacity', () => {
    it('returns capacity with carrier and LOB names', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'uc1', carrier_name: 'Hartford', line_of_business_name: 'GL', line_of_business_abbreviation: 'GL' },
          { id: 'uc2', carrier_name: 'Chubb', line_of_business_name: 'Property', line_of_business_abbreviation: 'PROP' },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await contactService.getCapacity('ct1', {});
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('carrier_name');
      expect(result.data[0]).toHaveProperty('line_of_business_name');
    });

    it('throws 404 if contact not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(contactService.getCapacity('nope', {})).rejects.toThrow('Contact not found');
    });
  });

  describe('getNetwork', () => {
    it('returns network relationships with user data joined', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({ rows: [makeContact()], command: '', rowCount: 1, oid: 0, fields: [] });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'nr1', user_first_name: 'Alice', user_last_name: 'Smith', user_email: 'alice@example.com', user_role: 'servicer', strength: 'strong' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await contactService.getNetwork('ct1', {});
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('user_first_name');
      expect(result.data[0]).toHaveProperty('user_role');
    });

    it('throws 404 if contact not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      await expect(contactService.getNetwork('nope', {})).rejects.toThrow('Contact not found');
    });
  });
});
