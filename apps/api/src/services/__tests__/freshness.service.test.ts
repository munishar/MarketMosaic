import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as freshnessService from '../freshness.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@brokerflow/shared', () => ({
  DataFreshnessStatus: {
    fresh: 'fresh',
    aging: 'aging',
    stale: 'stale',
    refresh_pending: 'refresh_pending',
    refresh_failed: 'refresh_failed',
  },
}));

import { query } from '@brokerflow/db';
import { eventBus } from '../../lib/event-bus';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);

const qr = (rows: Record<string, unknown>[] = [], rowCount = rows.length) => ({
  rows, command: '', rowCount, oid: 0, fields: [],
});

const makeFreshness = (overrides: Record<string, unknown> = {}) => ({
  id: 'fs1',
  entity_type: 'underwriter_capacity',
  entity_id: 'uc1',
  freshness_status: 'fresh',
  freshness_score: 95,
  last_verified_at: new Date().toISOString(),
  last_verified_by: 'u1',
  verification_source: 'manual',
  next_verification_due: '2025-06-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('FreshnessService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated freshness list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '2' }]))
        .mockResolvedValueOnce(qr([makeFreshness(), makeFreshness({ id: 'fs2' })]));

      const result = await freshnessService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });
  });

  describe('getByEntity', () => {
    it('returns freshness record when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeFreshness()]));
      const result = await freshnessService.getByEntity('underwriter_capacity', 'uc1');
      expect(result.id).toBe('fs1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(freshnessService.getByEntity('underwriter_capacity', 'nope')).rejects.toThrow('Freshness record not found');
    });
  });

  describe('refreshEntity', () => {
    it('refreshes entity with score 100', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeFreshness({ freshness_score: 100, freshness_status: 'fresh' })]));
      const result = await freshnessService.refreshEntity('underwriter_capacity', 'uc1', 'u1');
      expect(result.freshness_score).toBe(100);
    });

    it('uses manual as default verification source', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeFreshness()]));
      await freshnessService.refreshEntity('underwriter_capacity', 'uc1', 'u1');
      // Check the query was called with 'manual' verification source
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const callArgs = mockQuery.mock.calls[0][1] as unknown[];
      expect(callArgs[5]).toBe('manual');
    });
  });

  describe('recalculateAll', () => {
    it('recalculates all scores and emits events for stale records', async () => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 100); // 100 days ago — well past threshold

      mockQuery.mockResolvedValueOnce(qr([
        makeFreshness({ id: 'fs1', last_verified_at: staleDate.toISOString() }),
        makeFreshness({ id: 'fs2', last_verified_at: new Date().toISOString() }),
      ]));
      // updateScore calls for each record
      mockQuery.mockResolvedValueOnce(qr([makeFreshness({ id: 'fs1', freshness_score: 0 })]));
      mockQuery.mockResolvedValueOnce(qr([makeFreshness({ id: 'fs2', freshness_score: 100 })]));

      const result = await freshnessService.recalculateAll();
      expect(result.processed).toBe(2);
      expect(result.stale_count).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith('sync:dataStale', expect.objectContaining({
        entity_type: 'underwriter_capacity',
        entity_id: 'uc1',
      }));
    });

    it('returns zero stale when all are fresh', async () => {
      mockQuery.mockResolvedValueOnce(qr([
        makeFreshness({ id: 'fs1', last_verified_at: new Date().toISOString() }),
      ]));
      mockQuery.mockResolvedValueOnce(qr([makeFreshness()]));

      const result = await freshnessService.recalculateAll();
      expect(result.processed).toBe(1);
      expect(result.stale_count).toBe(0);
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('calculateFreshnessScore', () => {
    it('returns 100 for just verified', () => {
      const score = freshnessService.calculateFreshnessScore(new Date().toISOString());
      expect(score).toBe(100);
    });

    it('returns 0 for null last_verified_at', () => {
      const score = freshnessService.calculateFreshnessScore(null);
      expect(score).toBe(0);
    });

    it('returns 0 for very old date', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);
      const score = freshnessService.calculateFreshnessScore(oldDate.toISOString());
      expect(score).toBe(0);
    });

    it('returns ~50 for halfway through threshold', () => {
      const halfDate = new Date();
      halfDate.setDate(halfDate.getDate() - 45);
      const score = freshnessService.calculateFreshnessScore(halfDate.toISOString(), 90);
      expect(score).toBeGreaterThanOrEqual(49);
      expect(score).toBeLessThanOrEqual(51);
    });
  });

  describe('getFreshnessStatus', () => {
    it('returns fresh for score >= 70', () => {
      expect(freshnessService.getFreshnessStatus(70)).toBe('fresh');
      expect(freshnessService.getFreshnessStatus(100)).toBe('fresh');
    });

    it('returns aging for score >= 30 and < 70', () => {
      expect(freshnessService.getFreshnessStatus(30)).toBe('aging');
      expect(freshnessService.getFreshnessStatus(69)).toBe('aging');
    });

    it('returns stale for score < 30', () => {
      expect(freshnessService.getFreshnessStatus(0)).toBe('stale');
      expect(freshnessService.getFreshnessStatus(29)).toBe('stale');
    });
  });

  describe('markRefreshPending', () => {
    it('marks record as refresh_pending', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeFreshness({ freshness_status: 'refresh_pending' })]));
      const result = await freshnessService.markRefreshPending('underwriter_capacity', 'uc1');
      expect(result.freshness_status).toBe('refresh_pending');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(freshnessService.markRefreshPending('underwriter_capacity', 'nope')).rejects.toThrow('Freshness record not found');
    });
  });
});
