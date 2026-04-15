import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as manifestService from '../manifest.service';

vi.mock('@marketmosaic/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));

import { query } from '@marketmosaic/db';
import { eventBus } from '../../lib/event-bus';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);

const qr = (rows: Record<string, unknown>[] = [], rowCount = rows.length) => ({
  rows, command: '', rowCount, oid: 0, fields: [],
});

const makeManifest = (overrides: Record<string, unknown> = {}) => ({
  id: 'm1',
  manifest_type: 'entity_definition',
  key: 'clients',
  version: 1,
  config: JSON.stringify({ fields: ['name', 'address'] }),
  is_active: true,
  effective_from: '2025-01-01',
  effective_to: null,
  created_by: 'u1',
  change_notes: 'Initial version',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('ManifestService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated manifest list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '2' }]))
        .mockResolvedValueOnce(qr([makeManifest(), makeManifest({ id: 'm2', key: 'carriers' })]));

      const result = await manifestService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });
  });

  describe('getById', () => {
    it('returns manifest when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeManifest()]));
      const result = await manifestService.getById('m1');
      expect(result.id).toBe('m1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(manifestService.getById('nope')).rejects.toThrow('Manifest not found');
    });
  });

  describe('create', () => {
    it('creates manifest and emits event', async () => {
      // getMaxVersion
      mockQuery.mockResolvedValueOnce(qr([{ max_version: '0' }]));
      // INSERT
      mockQuery.mockResolvedValueOnce(qr([makeManifest()]));

      const result = await manifestService.create({
        manifest_type: 'entity_definition',
        key: 'clients',
        config: { fields: ['name', 'address'] },
        effective_from: '2025-01-01',
      }, 'u1');

      expect(result.id).toBe('m1');
      expect(mockEmit).toHaveBeenCalledWith('config:manifestUpdated', {
        manifest_type: 'entity_definition',
        key: 'clients',
        version: 1,
      });
    });
  });

  describe('update', () => {
    it('deactivates old version and creates new version with incremented version number', async () => {
      // findById (existing check)
      mockQuery.mockResolvedValueOnce(qr([makeManifest()]));
      // findById (in update query function)
      mockQuery.mockResolvedValueOnce(qr([makeManifest()]));
      // deactivate old version
      mockQuery.mockResolvedValueOnce(qr([{ id: 'm1' }]));
      // getMaxVersion
      mockQuery.mockResolvedValueOnce(qr([{ max_version: '1' }]));
      // INSERT new version
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ id: 'm2', version: 2, change_notes: 'Updated fields' })]));

      const result = await manifestService.update('m1', {
        config: { fields: ['name', 'address', 'phone'] },
        change_notes: 'Updated fields',
      }, 'u1');

      expect(result.version).toBe(2);
      expect(mockEmit).toHaveBeenCalledWith('config:manifestUpdated', {
        manifest_type: 'entity_definition',
        key: 'clients',
        version: 2,
      });
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(manifestService.update('nope', {}, 'u1')).rejects.toThrow('Manifest not found');
    });

    it('throws 400 when manifest is inactive', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ is_active: false })]));
      await expect(manifestService.update('m1', {}, 'u1')).rejects.toThrow('Cannot update an inactive manifest');
    });
  });

  describe('remove', () => {
    it('deactivates manifest', async () => {
      mockQuery.mockResolvedValueOnce(qr([{ id: 'm1' }]));
      await expect(manifestService.remove('m1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(manifestService.remove('nope')).rejects.toThrow('Manifest not found');
    });
  });

  describe('rollback', () => {
    it('rolls back to previous version', async () => {
      // findById (current)
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ version: 2 })]));
      // findByKeyAndVersion (target version)
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ id: 'm_old', version: 1, is_active: false })]));
      // deactivate current (in rollback query)
      mockQuery.mockResolvedValueOnce(qr([{ id: 'm1' }]));
      // activate target version
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ id: 'm_old', version: 1, is_active: true })]));

      const result = await manifestService.rollback('m1');
      expect(result.version).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith('config:manifestUpdated', {
        manifest_type: 'entity_definition',
        key: 'clients',
        version: 1,
      });
    });

    it('throws 404 when current not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(manifestService.rollback('nope')).rejects.toThrow('Manifest not found');
    });

    it('throws 400 when no previous version (version 1)', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ version: 1 })]));
      await expect(manifestService.rollback('m1')).rejects.toThrow('Cannot rollback: no previous version exists');
    });

    it('throws 404 when previous version not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeManifest({ version: 2 })]));
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(manifestService.rollback('m1')).rejects.toThrow('Previous version 1 not found');
    });
  });
});
