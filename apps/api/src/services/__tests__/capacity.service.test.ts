import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as capacityService from '../capacity.service';

vi.mock('@brokerflow/db', () => ({
  query: vi.fn(),
}));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

describe('CapacityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated capacity records with joined names', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'uc1',
              contact_first_name: 'John',
              carrier_name: 'Hartford',
              line_of_business_name: 'GL',
              max_limit: '1000000',
            },
            {
              id: 'uc2',
              contact_first_name: 'Jane',
              carrier_name: 'Chubb',
              line_of_business_name: 'Property',
              max_limit: '5000000',
            },
          ],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await capacityService.list({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('carrier_name');
      expect(result.data[0]).toHaveProperty('line_of_business_name');
      expect(result.data[0]).toHaveProperty('contact_first_name');
      expect(result.meta.total).toBe(2);
    });

    it('should support filtering by carrier_id', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'uc1', carrier_name: 'Hartford' }],
          command: '', rowCount: 1, oid: 0, fields: [],
        });

      const result = await capacityService.list({ carrier_id: 'car1' });
      expect(result.data).toHaveLength(1);
      // Verify the carrier_id was used in the query
      expect(mockQuery.mock.calls[0][1]).toContain('car1');
    });
  });

  describe('search', () => {
    it('should return denormalized results with contact, carrier, and LOB data', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [{
            id: 'uc1',
            contact_first_name: 'John',
            contact_last_name: 'Doe',
            contact_email: 'john@example.com',
            carrier_name: 'Hartford',
            carrier_type: 'admitted',
            carrier_rating: 'A+',
            carrier_appointed: true,
            line_of_business_name: 'General Liability',
            line_of_business_abbreviation: 'GL',
            line_of_business_category: 'casualty',
            max_limit: '2000000',
            available_capacity: '1000000',
            appetite_states: ['CA', 'NY'],
            appetite_classes: ['restaurant', 'retail'],
          }],
          command: '', rowCount: 1, oid: 0, fields: [],
        });

      const result = await capacityService.search({
        line_id: 'line1',
        carrier_id: 'car1',
        min_limit: '1000000',
        state: 'CA',
        industry_class: 'restaurant',
        has_available_capacity: true,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('contact_first_name');
      expect(result.data[0]).toHaveProperty('carrier_name');
      expect(result.data[0]).toHaveProperty('line_of_business_name');
      expect(result.data[0]).toHaveProperty('available_capacity');
    });

    it('should return empty results when no matches', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '0' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      const result = await capacityService.search({ state: 'ZZ' });
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should handle search with only has_available_capacity filter', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '3' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'uc1' }, { id: 'uc2' }, { id: 'uc3' }],
          command: '', rowCount: 3, oid: 0, fields: [],
        });

      const result = await capacityService.search({ has_available_capacity: true });
      expect(result.data).toHaveLength(3);
      // Verify the available_capacity condition was included
      const countCall = mockQuery.mock.calls[0][0] as string;
      expect(countCall).toContain('available_capacity IS NOT NULL');
    });

    it('should support pagination', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '50' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      const result = await capacityService.search({ page: 2, limit: 10 });
      expect(result.meta).toEqual({ page: 2, limit: 10, total: 50, total_pages: 5 });
    });
  });

  describe('getById', () => {
    it('should return capacity record with joined data', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'uc1',
          contact_first_name: 'John',
          carrier_name: 'Hartford',
          line_of_business_name: 'GL',
        }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await capacityService.getById('uc1');
      expect(result).toHaveProperty('carrier_name');
      expect(result).toHaveProperty('line_of_business_name');
    });

    it('should throw 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(capacityService.getById('nonexistent')).rejects.toThrow('Capacity record not found');
    });
  });

  describe('create', () => {
    it('should create a capacity record', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'uc1',
          contact_id: 'ct1',
          carrier_id: 'car1',
          line_of_business_id: 'lob1',
          max_limit: '1000000',
        }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await capacityService.create({
        contact_id: 'ct1',
        carrier_id: 'car1',
        line_of_business_id: 'lob1',
        max_limit: '1000000',
        appetite_states: ['CA', 'NY'],
        appetite_classes: ['restaurant'],
      }, 'user1');

      expect(result.max_limit).toBe('1000000');
    });
  });

  describe('update', () => {
    it('should update and return capacity record', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'uc1', max_limit: '2000000' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await capacityService.update('uc1', { max_limit: '2000000' }, 'user1');
      expect(result.max_limit).toBe('2000000');
    });

    it('should throw 404 when updating non-existent record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(capacityService.update('nonexistent', { max_limit: '1000' }, 'user1')).rejects.toThrow('Capacity record not found');
    });
  });

  describe('remove', () => {
    it('should soft-delete a capacity record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'uc1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await expect(capacityService.remove('uc1', 'user1')).resolves.toBeUndefined();
    });
  });
});
