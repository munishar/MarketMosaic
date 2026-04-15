import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as submissionService from '../submission.service';

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

const makeSubmission = (overrides: Record<string, unknown> = {}) => ({
  id: 's1',
  client_id: 'cl1',
  created_by: 'u1',
  status: 'draft',
  effective_date: '2025-01-01',
  expiration_date: '2026-01-01',
  lines_requested: JSON.stringify([{ line_of_business_id: 'lob1', requested_limit: null, notes: null }]),
  notes: null,
  priority: 'normal',
  renewal_of: null,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  updated_by: null,
  ...overrides,
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
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('SubmissionService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated submission list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '2' }]))
        .mockResolvedValueOnce(qr([
          makeSubmission({ client_name: 'Acme Corp' }),
          makeSubmission({ id: 's2', client_name: 'Beta LLC' }),
        ]));

      const result = await submissionService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });

    it('filters by status', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeSubmission()]));

      await submissionService.list({ status: 'draft' });
      expect(mockQuery.mock.calls[0][1]).toContain('draft');
    });

    it('filters by client_id', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeSubmission()]));

      await submissionService.list({ client_id: 'cl1' });
      expect(mockQuery.mock.calls[0][1]).toContain('cl1');
    });
  });

  describe('getById', () => {
    it('returns submission with targets when found', async () => {
      // findById (inside findByIdWithTargets)
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));
      // targets query
      mockQuery.mockResolvedValueOnce(qr([makeTarget()]));

      const result = await submissionService.getById('s1');
      expect(result.id).toBe('s1');
      expect((result.targets as Record<string, unknown>[]).length).toBe(1);
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(submissionService.getById('nope')).rejects.toThrow('Submission not found');
    });
  });

  describe('create', () => {
    it('creates submission and emits event', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));

      const result = await submissionService.create({
        client_id: 'cl1',
        effective_date: '2025-01-01',
        expiration_date: '2026-01-01',
        lines_requested: [{ line_of_business_id: 'lob1' }],
      }, 'u1');

      expect(result.id).toBe('s1');
      expect(mockEmit).toHaveBeenCalledWith('submission:created', {
        submission_id: 's1',
        client_id: 'cl1',
        created_by: 'u1',
      });
    });
  });

  describe('update', () => {
    it('updates submission when found', async () => {
      // findById check
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));
      // update
      mockQuery.mockResolvedValueOnce(qr([makeSubmission({ notes: 'Updated' })]));

      const result = await submissionService.update('s1', { notes: 'Updated' }, 'u1');
      expect(result.notes).toBe('Updated');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(submissionService.update('nope', { notes: 'X' }, 'u1')).rejects.toThrow('Submission not found');
    });
  });

  describe('remove', () => {
    it('soft-deletes submission', async () => {
      mockQuery.mockResolvedValueOnce(qr([{ id: 's1' }]));
      await expect(submissionService.remove('s1', 'u1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(submissionService.remove('nope', 'u1')).rejects.toThrow('Submission not found');
    });
  });

  describe('addTarget', () => {
    it('adds target to existing submission', async () => {
      // findById check
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));
      // createTarget
      mockQuery.mockResolvedValueOnce(qr([makeTarget()]));

      const result = await submissionService.addTarget({
        submission_id: 's1',
        contact_id: 'ct1',
        carrier_id: 'cr1',
        line_of_business_id: 'lob1',
      }, 'u1');

      expect(result.id).toBe('st1');
    });

    it('throws 404 when submission not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(submissionService.addTarget({
        submission_id: 'nope',
        contact_id: 'ct1',
        carrier_id: 'cr1',
        line_of_business_id: 'lob1',
      }, 'u1')).rejects.toThrow('Submission not found');
    });
  });

  describe('send', () => {
    it('sends submission with targets and emits event', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));
      // findTargetsBySubmissionId
      mockQuery.mockResolvedValueOnce(qr([makeTarget()]));
      // update submission status
      mockQuery.mockResolvedValueOnce(qr([makeSubmission({ status: 'submitted' })]));
      // markTargetsAsSent
      mockQuery.mockResolvedValueOnce(qr([makeTarget({ status: 'submitted', sent_at: '2025-01-01T00:00:00Z' })]));

      const result = await submissionService.send('s1', 'u1');
      expect(result.status).toBe('submitted');
      expect(mockEmit).toHaveBeenCalledWith('submission:sent', {
        submission_id: 's1',
        target_ids: ['st1'],
      });
    });

    it('throws 404 when submission not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(submissionService.send('nope', 'u1')).rejects.toThrow('Submission not found');
    });

    it('throws validation error when no targets exist', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeSubmission()]));
      // findTargetsBySubmissionId returns empty
      mockQuery.mockResolvedValueOnce(qr([]));

      await expect(submissionService.send('s1', 'u1')).rejects.toThrow('Submission must have at least one target before sending');
    });
  });
});
