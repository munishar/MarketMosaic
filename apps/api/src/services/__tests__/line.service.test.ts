import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as lineService from '../line.service';

vi.mock('@marketmosaic/db', () => ({
  query: vi.fn(),
}));

import { query } from '@marketmosaic/db';
const mockQuery = vi.mocked(query);

describe('LineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated LOB list with parent_line_id for tree building', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '4' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'l1', name: 'Casualty', parent_line_id: null, parent_line_name: null },
            { id: 'l2', name: 'General Liability', parent_line_id: 'l1', parent_line_name: 'Casualty' },
            { id: 'l3', name: 'Property', parent_line_id: null, parent_line_name: null },
            { id: 'l4', name: 'Specialty', parent_line_id: null, parent_line_name: null },
          ],
          command: '', rowCount: 4, oid: 0, fields: [],
        });

      const result = await lineService.list({});

      expect(result.data).toHaveLength(4);
      expect(result.data[1]).toHaveProperty('parent_line_id', 'l1');
      expect(result.data[1]).toHaveProperty('parent_line_name', 'Casualty');
      expect(result.meta.total).toBe(4);
    });
  });

  describe('getById', () => {
    it('should return LOB with parent name', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l2', name: 'General Liability', parent_line_id: 'l1', parent_line_name: 'Casualty' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await lineService.getById('l2');
      expect(result.name).toBe('General Liability');
      expect(result.parent_line_name).toBe('Casualty');
    });

    it('should throw 404 when LOB not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(lineService.getById('nonexistent')).rejects.toThrow('Line of business not found');
    });
  });

  describe('getChildren', () => {
    it('should return child LOBs', async () => {
      // findById call
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l1', name: 'Casualty' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // findChildren call
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'l2', name: 'General Liability', parent_line_id: 'l1' },
          { id: 'l3', name: 'Umbrella', parent_line_id: 'l1' },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const children = await lineService.getChildren('l1');
      expect(children).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create a root LOB', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l1', name: 'Casualty', category: 'casualty', parent_line_id: null }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await lineService.create(
        { name: 'Casualty', abbreviation: 'CAS', category: 'casualty' },
        'user1',
      );
      expect(result.name).toBe('Casualty');
    });

    it('should create a child LOB when parent exists', async () => {
      // findById for parent validation
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l1', name: 'Casualty' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // create
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l2', name: 'GL', parent_line_id: 'l1' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await lineService.create(
        { name: 'GL', abbreviation: 'GL', category: 'casualty', parent_line_id: 'l1' },
        'user1',
      );
      expect(result.parent_line_id).toBe('l1');
    });

    it('should throw error when parent does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(
        lineService.create({ name: 'GL', abbreviation: 'GL', category: 'casualty', parent_line_id: 'invalid' }, 'user1'),
      ).rejects.toThrow('Parent line of business not found');
    });
  });

  describe('update', () => {
    it('should prevent circular reference', async () => {
      await expect(
        lineService.update('l1', { parent_line_id: 'l1' }, 'user1'),
      ).rejects.toThrow('A line of business cannot be its own parent');
    });

    it('should update and return LOB', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l1', name: 'Updated' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await lineService.update('l1', { name: 'Updated' }, 'user1');
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should prevent deletion of LOB with children', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'l2', name: 'GL', parent_line_id: 'l1' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      await expect(lineService.remove('l1', 'user1')).rejects.toThrow('Cannot delete a line of business that has child lines');
    });

    it('should soft-delete LOB with no children', async () => {
      // findChildren returns empty
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      // deactivate
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'l2' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await expect(lineService.remove('l2', 'user1')).resolves.toBeUndefined();
    });

    it('should throw 404 for non-existent LOB', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(lineService.remove('nonexistent', 'user1')).rejects.toThrow('Line of business not found');
    });
  });
});
