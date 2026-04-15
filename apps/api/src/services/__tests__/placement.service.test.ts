import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as placementService from '../placement.service';

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

const makeTarget = (overrides: Record<string, unknown> = {}) => ({
  id: 'st1',
  submission_id: 's1',
  contact_id: 'ct1',
  carrier_id: 'cr1',
  line_of_business_id: 'lob1',
  status: 'pending',
  sent_at: null,
  response_due: null,
  quoted_premium: null,
  quoted_limit: null,
  quoted_deductible: null,
  quoted_terms: null,
  decline_reason: null,
  notes: null,
  client_id: 'cl1',
  submission_status: 'submitted',
  client_name: 'Acme Corp',
  carrier_name: 'Carrier A',
  contact_first_name: 'John',
  contact_last_name: 'Doe',
  line_of_business_name: 'General Liability',
  line_of_business_abbreviation: 'GL',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('PlacementService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('updateStatus', () => {
    it('transitions from pending to submitted', async () => {
      // findTargetById
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'pending' })]));
      // updateTargetStatus
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'submitted' })]));

      const result = await placementService.updateStatus('st1', { status: 'submitted' }, 'u1');
      expect(result.status).toBe('submitted');
      expect(mockEmit).toHaveBeenCalledWith('placement:statusChanged', {
        target_id: 'st1',
        submission_id: 's1',
        old_status: 'pending',
        new_status: 'submitted',
      });
    });

    it('transitions from submitted to reviewing', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'submitted' })]));
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'reviewing' })]));

      const result = await placementService.updateStatus('st1', { status: 'reviewing' }, 'u1');
      expect(result.status).toBe('reviewing');
    });

    it('transitions from reviewing to quoted', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'reviewing' })]));
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'quoted', quoted_premium: 5000 })]));

      const result = await placementService.updateStatus('st1', { status: 'quoted', quoted_premium: 5000 }, 'u1');
      expect(result.status).toBe('quoted');
    });

    it('transitions from reviewing to declined', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'reviewing' })]));
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'declined', decline_reason: 'Risk too high' })]));

      const result = await placementService.updateStatus('st1', { status: 'declined', decline_reason: 'Risk too high' }, 'u1');
      expect(result.status).toBe('declined');
    });

    it('transitions from quoted to bound', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'quoted' })]));
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'bound' })]));

      const result = await placementService.updateStatus('st1', { status: 'bound' }, 'u1');
      expect(result.status).toBe('bound');
    });

    it('rejects invalid transition from pending to quoted', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'pending' })]));

      await expect(placementService.updateStatus('st1', { status: 'quoted' }, 'u1'))
        .rejects.toThrow("Cannot transition from 'pending' to 'quoted'");
    });

    it('rejects transition from bound (terminal)', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'bound' })]));

      await expect(placementService.updateStatus('st1', { status: 'submitted' }, 'u1'))
        .rejects.toThrow("Cannot transition from 'bound' to 'submitted'");
    });

    it('rejects transition from declined (terminal)', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'declined' })]));

      await expect(placementService.updateStatus('st1', { status: 'reviewing' }, 'u1'))
        .rejects.toThrow("Cannot transition from 'declined' to 'reviewing'");
    });

    it('rejects transition from expired (terminal)', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'expired' })]));

      await expect(placementService.updateStatus('st1', { status: 'submitted' }, 'u1'))
        .rejects.toThrow("Cannot transition from 'expired' to 'submitted'");
    });

    it('throws 404 when target not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(placementService.updateStatus('nope', { status: 'submitted' }, 'u1'))
        .rejects.toThrow('Placement target not found');
    });
  });

  describe('getKanban', () => {
    it('returns placements grouped by status columns', async () => {
      mockQuery.mockResolvedValueOnce(qr([
        makeTarget({ status: 'pending', days_in_status: 2 }),
        makeTarget({ id: 'st2', status: 'submitted', days_in_status: 1 }),
        makeTarget({ id: 'st3', status: 'quoted', days_in_status: 5 }),
      ]));

      const result = await placementService.getKanban();
      expect(result.columns.pending).toHaveLength(1);
      expect(result.columns.submitted).toHaveLength(1);
      expect(result.columns.quoted).toHaveLength(1);
      expect(result.columns.bound).toHaveLength(0);
      expect(result.columns.declined).toHaveLength(0);
    });
  });

  describe('getTimeline', () => {
    it('returns paginated timeline data', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '3' }]))
        .mockResolvedValueOnce(qr([
          makeTarget({ id: 'st1' }),
          makeTarget({ id: 'st2' }),
          makeTarget({ id: 'st3' }),
        ]));

      const result = await placementService.getTimeline({});
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('filters by status', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeTarget({ status: 'quoted' })]));

      await placementService.getTimeline({ status: 'quoted' });
      expect(mockQuery.mock.calls[0][1]).toContain('quoted');
    });
  });
});
