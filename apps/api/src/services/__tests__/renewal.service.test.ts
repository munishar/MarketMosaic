import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as renewalService from '../renewal.service';

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

const futureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const makeSubmission = (overrides: Record<string, unknown> = {}) => ({
  id: 's1',
  client_id: 'cl1',
  created_by: 'u1',
  status: 'bound',
  effective_date: '2024-01-01',
  expiration_date: '2025-01-01',
  lines_requested: JSON.stringify([{ line_of_business_id: 'lob1', requested_limit: null, notes: null }]),
  notes: null,
  priority: 'normal',
  renewal_of: null,
  is_active: true,
  client_name: 'Acme Corp',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('RenewalService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated renewal list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeSubmission()]));

      const result = await renewalService.list({});
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getUpcoming', () => {
    it('returns upcoming renewals within windows', async () => {
      const expiringIn30 = makeSubmission({
        id: 's1',
        expiration_date: futureDate(30),
        client_name: 'Acme',
      });
      const expiringIn90 = makeSubmission({
        id: 's2',
        expiration_date: futureDate(90),
        client_name: 'Beta',
      });

      mockQuery.mockResolvedValueOnce(qr([expiringIn30, expiringIn90]));

      const result = await renewalService.getUpcoming([120, 90, 60, 30]);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].days_until_expiry).toBeGreaterThan(0);
    });

    it('uses default windows when not provided', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));

      const result = await renewalService.getUpcoming();
      expect(result.data).toHaveLength(0);
      // Should query with max window = 120
      expect(mockQuery.mock.calls[0][1]).toContain(120);
    });
  });

  describe('initiate', () => {
    it('creates renewal submission from original', async () => {
      // findById for original
      mockQuery.mockResolvedValueOnce(qr([makeSubmission({
        expiration_date: '2025-01-01',
        lines_requested: [{ line_of_business_id: 'lob1', requested_limit: null, notes: null }],
      })]));
      // create new submission
      mockQuery.mockResolvedValueOnce(qr([makeSubmission({
        id: 's2',
        renewal_of: 's1',
        effective_date: '2025-01-01',
        expiration_date: '2026-01-01',
        status: 'draft',
      })]));

      const result = await renewalService.initiate('s1', 'u1');
      expect(result.id).toBe('s2');
      expect(result.renewal_of).toBe('s1');
      expect(mockEmit).toHaveBeenCalledWith('submission:created', {
        submission_id: 's2',
        client_id: 'cl1',
        created_by: 'u1',
      });
    });

    it('throws 404 when original not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(renewalService.initiate('nope', 'u1')).rejects.toThrow('Submission not found');
    });
  });

  describe('scanUpcomingRenewals', () => {
    it('creates notifications for exact window matches', async () => {
      const sub = makeSubmission({
        id: 's1',
        expiration_date: futureDate(30),
        client_name: 'Acme Corp',
      });

      // findUpcomingRenewals
      mockQuery.mockResolvedValueOnce(qr([sub]));
      // createNotification
      mockQuery.mockResolvedValueOnce(qr([{ id: 'n1' }]));

      const result = await renewalService.scanUpcomingRenewals();
      expect(result.notified).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith('renewal:upcoming', expect.objectContaining({
        submission_id: 's1',
        client_id: 'cl1',
      }));
    });

    it('skips submissions not on exact window days', async () => {
      const sub = makeSubmission({
        id: 's1',
        expiration_date: futureDate(45),
        client_name: 'Acme Corp',
      });

      mockQuery.mockResolvedValueOnce(qr([sub]));

      const result = await renewalService.scanUpcomingRenewals();
      expect(result.notified).toBe(0);
    });

    it('handles empty results', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      const result = await renewalService.scanUpcomingRenewals();
      expect(result.notified).toBe(0);
    });
  });
});
