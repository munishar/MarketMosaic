import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as formService from '../form.service';

vi.mock('@brokerflow/db', () => ({
  query: vi.fn(),
}));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

describe('FormService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated form list with carrier and LOB names', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'f1', name: 'CG 00 01', carrier_name: 'Hartford', line_of_business_name: 'GL' },
            { id: 'f2', name: 'CP 00 10', carrier_name: 'Chubb', line_of_business_name: 'Property' },
          ],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await formService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('carrier_name');
      expect(result.data[0]).toHaveProperty('line_of_business_name');
    });

    it('should support filtering by carrier_id and line_of_business_id', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'f1', name: 'CG 00 01' }],
          command: '', rowCount: 1, oid: 0, fields: [],
        });

      const result = await formService.list({ carrier_id: 'car1', line_of_business_id: 'lob1' });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return form with joined names', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'f1', name: 'CG 00 01', carrier_name: 'Hartford', line_of_business_name: 'GL' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await formService.getById('f1');
      expect(result.name).toBe('CG 00 01');
    });

    it('should throw 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(formService.getById('nonexistent')).rejects.toThrow('Form/paper not found');
    });
  });

  describe('create', () => {
    it('should create and return a form', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'f1', name: 'CG 00 01', type: 'occurrence', carrier_id: 'car1', line_of_business_id: 'lob1' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await formService.create({
        name: 'CG 00 01',
        type: 'occurrence',
        carrier_id: 'car1',
        line_of_business_id: 'lob1',
      }, 'user1');
      expect(result.name).toBe('CG 00 01');
    });
  });

  describe('update', () => {
    it('should update and return form', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'f1', name: 'Updated Form' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await formService.update('f1', { name: 'Updated Form' }, 'user1');
      expect(result.name).toBe('Updated Form');
    });

    it('should throw 404 when form not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(formService.update('nonexistent', { name: 'X' }, 'user1')).rejects.toThrow('Form/paper not found');
    });
  });

  describe('remove', () => {
    it('should soft-delete a form', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'f1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await expect(formService.remove('f1', 'user1')).resolves.toBeUndefined();
    });

    it('should throw 404 for non-existent form', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(formService.remove('nonexistent', 'user1')).rejects.toThrow('Form/paper not found');
    });
  });
});
