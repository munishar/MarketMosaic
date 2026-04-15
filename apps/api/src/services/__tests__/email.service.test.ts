import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailService from '../email.service';

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

const makeEmail = (overrides: Record<string, unknown> = {}) => ({
  id: 'e1',
  thread_id: 't1',
  direction: 'inbound',
  from_address: 'john@carrier.com',
  to_addresses: ['broker@marketmosaic.io'],
  cc_addresses: [],
  subject: 'Quote for Acme Corp GL',
  body_text: 'Here is the quote...',
  body_html: null,
  sent_at: '2025-01-15T10:00:00Z',
  client_id: 'cl1',
  submission_id: 's1',
  contact_id: 'ct1',
  attachments: '[]',
  parsed_data: null,
  parse_status: 'unparsed',
  sent_by_user_id: null,
  source: 'platform',
  import_job_id: null,
  external_message_id: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('EmailService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('sendEmail', () => {
    it('creates outbound email and emits event', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeEmail({
        id: 'e2',
        direction: 'outbound',
        sent_by_user_id: 'u1',
      })]));

      const result = await emailService.sendEmail({
        to_addresses: ['john@carrier.com'],
        subject: 'Submission for Acme',
        body_text: 'Please see attached.',
        client_id: 'cl1',
        submission_id: 's1',
      }, 'u1');

      expect(result.id).toBe('e2');
      expect(result.direction).toBe('outbound');
      expect(mockEmit).toHaveBeenCalledWith('email:sent', {
        email_id: 'e2',
        submission_id: 's1',
        contact_id: 'ct1',
      });
    });
  });

  describe('saveDraft', () => {
    it('creates draft email without emitting event', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ id: 'e3', direction: 'outbound' })]));

      const result = await emailService.saveDraft({
        to_addresses: ['john@carrier.com'],
        subject: 'Draft',
        body_text: 'Draft content',
      }, 'u1');

      expect(result.id).toBe('e3');
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('receiveEmail', () => {
    it('creates inbound email with auto-linked contact and emits event', async () => {
      // findContactByEmail
      mockQuery.mockResolvedValueOnce(qr([{ id: 'ct1', email: 'john@carrier.com', is_active: true }]));
      // findSubmissionBySubjectOrThread — thread lookup returns empty
      mockQuery.mockResolvedValueOnce(qr([]));
      // findSubmissionBySubjectOrThread — subject lookup
      mockQuery.mockResolvedValueOnce(qr([{ id: 's1', is_active: true }]));
      // create email
      mockQuery.mockResolvedValueOnce(qr([makeEmail()]));

      const result = await emailService.receiveEmail({
        from_address: 'john@carrier.com',
        to_addresses: ['broker@marketmosaic.io'],
        subject: 'Quote for Acme Corp GL',
        body_text: 'Here is the quote...',
        thread_id: 't1',
      });

      expect(result.id).toBe('e1');
      expect(mockEmit).toHaveBeenCalledWith('email:received', {
        email_id: 'e1',
        contact_id: 'ct1',
      });
    });

    it('creates inbound email without contact match', async () => {
      // findContactByEmail returns empty
      mockQuery.mockResolvedValueOnce(qr([]));
      // findSubmissionBySubjectOrThread — no thread
      mockQuery.mockResolvedValueOnce(qr([]));
      // create email
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ contact_id: null, submission_id: null })]));

      const result = await emailService.receiveEmail({
        from_address: 'unknown@example.com',
        subject: 'Random email',
        body_text: 'No match',
      });

      expect(result.id).toBe('e1');
      expect(mockEmit).toHaveBeenCalledWith('email:received', {
        email_id: 'e1',
        contact_id: undefined,
      });
    });
  });

  describe('listInbox', () => {
    it('returns paginated inbox', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '2' }]))
        .mockResolvedValueOnce(qr([makeEmail(), makeEmail({ id: 'e2' })]));

      const result = await emailService.listInbox({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });
  });

  describe('getThread', () => {
    it('returns emails in thread', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeEmail(), makeEmail({ id: 'e2' })]));

      const result = await emailService.getThread('t1');
      expect(result).toHaveLength(2);
    });

    it('throws 404 when thread not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailService.getThread('nope')).rejects.toThrow('Thread not found');
    });
  });

  describe('getById', () => {
    it('returns email when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeEmail()]));
      const result = await emailService.getById('e1');
      expect(result.id).toBe('e1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailService.getById('nope')).rejects.toThrow('Email not found');
    });
  });

  describe('listParseQueue', () => {
    it('returns paginated parse queue', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeEmail({ parse_status: 'unparsed' })]));

      const result = await emailService.listParseQueue({});
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
