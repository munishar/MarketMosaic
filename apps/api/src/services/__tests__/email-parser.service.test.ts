import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailParserService from '../email-parser.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('../../ai/email-parser', () => ({
  parseEmailWithAI: vi.fn(),
}));

import { query } from '@brokerflow/db';
import { eventBus } from '../../lib/event-bus';
import { parseEmailWithAI } from '../../ai/email-parser';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);
const mockParseAI = vi.mocked(parseEmailWithAI);

const qr = (rows: Record<string, unknown>[] = [], rowCount = rows.length) => ({
  rows, command: '', rowCount, oid: 0, fields: [],
});

const makeEmail = (overrides: Record<string, unknown> = {}) => ({
  id: 'e1',
  thread_id: 't1',
  direction: 'inbound',
  from_address: 'john@carrier.com',
  to_addresses: ['broker@brokerflow.io'],
  cc_addresses: [],
  subject: 'Quote for Acme Corp GL',
  body_text: 'Premium: $50,000. Limits: $1M/$2M. Deductible: $5,000.',
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
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
});

const makeParsedData = (overrides: Record<string, unknown> = {}) => ({
  type: 'quote',
  premium: 50000,
  limits: '$1M/$2M',
  deductible: 5000,
  sir: null,
  terms: ['Annual policy'],
  conditions: ['Clean loss runs required'],
  exclusions: ['Pollution'],
  effective_date: '2025-03-01',
  carrier: 'Acme Insurance',
  underwriter_name: 'John Smith',
  confidence_score: 0.92,
  ...overrides,
});

describe('EmailParserService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('triggerParse', () => {
    it('parses email with AI and updates parsed data', async () => {
      const parsed = makeParsedData();
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeEmail()]));
      mockParseAI.mockResolvedValueOnce(parsed);
      // updateParsedData
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parsed_data: parsed, parse_status: 'parsed' })]));

      const result = await emailParserService.triggerParse('e1');
      expect(result.parse_status).toBe('parsed');
      expect(mockEmit).toHaveBeenCalledWith('email:parsed', {
        email_id: 'e1',
        target_id: 's1',
        confidence: 0.92,
      });
    });

    it('sets review_needed when confidence < 0.8', async () => {
      const parsed = makeParsedData({ confidence_score: 0.65 });
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeEmail()]));
      mockParseAI.mockResolvedValueOnce(parsed);
      // updateParsedData
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parsed_data: parsed, parse_status: 'review_needed' })]));

      const result = await emailParserService.triggerParse('e1');
      expect(result.parse_status).toBe('review_needed');
      expect(mockEmit).not.toHaveBeenCalled();
    });

    it('sets review_needed when AI is unavailable', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeEmail()]));
      mockParseAI.mockResolvedValueOnce(null);
      // updateParsedData
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parse_status: 'review_needed' })]));

      const result = await emailParserService.triggerParse('e1');
      expect(result.parse_status).toBe('review_needed');
    });

    it('throws 404 when email not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailParserService.triggerParse('nope')).rejects.toThrow('Email not found');
    });
  });

  describe('confirmParse', () => {
    it('confirms parsed data and emits event', async () => {
      const parsed = makeParsedData();
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parsed_data: parsed, parse_status: 'review_needed' })]));
      // updateParsedData
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parsed_data: parsed, parse_status: 'confirmed' })]));

      const result = await emailParserService.confirmParse('e1');
      expect(result.parse_status).toBe('confirmed');
      expect(mockEmit).toHaveBeenCalledWith('email:parsed', {
        email_id: 'e1',
        target_id: 's1',
        confidence: 0.92,
      });
    });

    it('merges confirmedData with existing parsed data', async () => {
      const parsed = makeParsedData();
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeEmail({ parsed_data: parsed, parse_status: 'review_needed' })]));
      // updateParsedData
      mockQuery.mockResolvedValueOnce(qr([makeEmail({
        parsed_data: { ...parsed, premium: 55000 },
        parse_status: 'confirmed',
      })]));

      const result = await emailParserService.confirmParse('e1', { premium: 55000 });
      expect(result.parse_status).toBe('confirmed');
    });

    it('throws 404 when email not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailParserService.confirmParse('nope')).rejects.toThrow('Email not found');
    });
  });
});
