import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as carrierService from '../carrier.service';

// Mock @brokerflow/db
vi.mock('@brokerflow/db', () => ({
  query: vi.fn(),
}));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

describe('CarrierService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated carrier list with defaults', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '3' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'c1', name: 'Carrier A', type: 'admitted', is_active: true },
            { id: 'c2', name: 'Carrier B', type: 'non_admitted', is_active: true },
            { id: 'c3', name: 'Carrier C', type: 'surplus', is_active: true },
          ],
          command: '', rowCount: 3, oid: 0, fields: [],
        });

      const result = await carrierService.list({});

      expect(result.data).toHaveLength(3);
      expect(result.meta).toEqual({ page: 1, limit: 25, total: 3, total_pages: 1 });
    });

    it('should support pagination parameters', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '50' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      const result = await carrierService.list({ page: 3, limit: 10 });

      expect(result.meta).toEqual({ page: 3, limit: 10, total: 50, total_pages: 5 });
    });

    it('should support search parameter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'c1', name: 'Hartford', type: 'admitted' }],
          command: '', rowCount: 1, oid: 0, fields: [],
        });

      const result = await carrierService.list({ search: 'Hartford' });

      expect(result.data).toHaveLength(1);
      const countCall = mockQuery.mock.calls[0];
      expect(countCall[1]).toEqual(['%Hartford%']);
    });
  });

  describe('getById', () => {
    it('should return carrier when found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'c1', name: 'Hartford', type: 'admitted', is_active: true }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await carrierService.getById('c1');
      expect(result.name).toBe('Hartford');
    });

    it('should throw 404 when carrier not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(carrierService.getById('nonexistent')).rejects.toThrow('Carrier not found');
    });
  });

  describe('create', () => {
    it('should create and return a carrier', async () => {
      const newCarrier = { id: 'c1', name: 'New Carrier', type: 'admitted', is_active: true };
      mockQuery.mockResolvedValueOnce({ rows: [newCarrier], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await carrierService.create({ name: 'New Carrier', type: 'admitted' }, 'user1');
      expect(result.name).toBe('New Carrier');
    });
  });

  describe('update', () => {
    it('should update and return the carrier', async () => {
      const updated = { id: 'c1', name: 'Updated Carrier', type: 'admitted' };
      mockQuery.mockResolvedValueOnce({ rows: [updated], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await carrierService.update('c1', { name: 'Updated Carrier' }, 'user1');
      expect(result.name).toBe('Updated Carrier');
    });

    it('should throw 404 when updating non-existent carrier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(carrierService.update('nonexistent', { name: 'X' }, 'user1')).rejects.toThrow('Carrier not found');
    });
  });

  describe('remove', () => {
    it('should soft-delete a carrier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'c1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await expect(carrierService.remove('c1', 'user1')).resolves.toBeUndefined();
    });

    it('should throw 404 when removing non-existent carrier', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(carrierService.remove('nonexistent', 'user1')).rejects.toThrow('Carrier not found');
    });
  });

  describe('getContacts', () => {
    it('should return contacts for a carrier', async () => {
      // First call: findById (verify carrier exists)
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'c1', name: 'Hartford' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // Second call: count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // Third call: data
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'ct1', first_name: 'John', last_name: 'Doe' },
          { id: 'ct2', first_name: 'Jane', last_name: 'Smith' },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await carrierService.getContacts('c1', {});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should throw 404 if carrier does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(carrierService.getContacts('nonexistent', {})).rejects.toThrow('Carrier not found');
    });
  });

  describe('getForms', () => {
    it('should return forms for a carrier with LOB names joined', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'c1', name: 'Hartford' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'f1', name: 'CG 00 01', line_of_business_name: 'General Liability', line_of_business_abbreviation: 'GL' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await carrierService.getForms('c1', {});
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('line_of_business_name');
    });
  });

  describe('getLines', () => {
    it('should return lines of business for a carrier', async () => {
      // findById
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'c1', name: 'Hartford' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // count
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] });
      // data
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'l1', name: 'General Liability', abbreviation: 'GL' },
          { id: 'l2', name: 'Property', abbreviation: 'PROP' },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await carrierService.getLines('c1', {});
      expect(result.data).toHaveLength(2);
    });
  });
});
