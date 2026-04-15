import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as attachmentService from '../attachment.service';

vi.mock('@marketmosaic/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/storage', () => ({
  storage: {
    upload: vi.fn().mockResolvedValue({ url: 'http://localhost/uploads/test.pdf', key: 'attachments/test.pdf', bucket: 'local' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import { query } from '@marketmosaic/db';
import { storage } from '../../lib/storage';
const mockQuery = vi.mocked(query);
const mockUpload = vi.mocked(storage.upload);
const mockDelete = vi.mocked(storage.delete);

const makeAttachment = (overrides = {}) => ({
  id: 'att1',
  filename: 'policy.pdf',
  file_url: 'http://localhost/uploads/policy.pdf',
  file_size: 12345,
  mime_type: 'application/pdf',
  type: 'policy',
  client_id: 'cl1',
  submission_id: null,
  email_id: null,
  uploaded_by: 'u1',
  description: null,
  tags: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const emptyResult = { rows: [], command: '', rowCount: 0, oid: 0, fields: [] };

describe('AttachmentService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('list', () => {
    it('returns paginated attachment list', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '2' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({
          rows: [makeAttachment(), makeAttachment({ id: 'att2', filename: 'quote.pdf' })],
          command: '', rowCount: 2, oid: 0, fields: [],
        });

      const result = await attachmentService.list({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });

    it('filters by client_id', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeAttachment()], command: '', rowCount: 1, oid: 0, fields: [] });

      await attachmentService.list({ client_id: 'cl1' });
      expect(mockQuery.mock.calls[0][1]).toContain('cl1');
    });

    it('filters by type', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeAttachment()], command: '', rowCount: 1, oid: 0, fields: [] });

      await attachmentService.list({ type: 'policy' });
      expect(mockQuery.mock.calls[0][1]).toContain('policy');
    });
  });

  describe('getById', () => {
    it('returns attachment when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeAttachment()], command: '', rowCount: 1, oid: 0, fields: [] });
      const result = await attachmentService.getById('att1');
      expect(result.filename).toBe('policy.pdf');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(attachmentService.getById('nope')).rejects.toThrow('Attachment not found');
    });
  });

  describe('getByClientId', () => {
    it('returns attachments for a client', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: '1' }], command: '', rowCount: 1, oid: 0, fields: [] })
        .mockResolvedValueOnce({ rows: [makeAttachment()], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await attachmentService.getByClientId('cl1', {});
      expect(result.data).toHaveLength(1);
      expect(mockQuery.mock.calls[0][1]).toContain('cl1');
    });
  });

  describe('upload', () => {
    it('uploads file to storage and persists metadata', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeAttachment()], command: '', rowCount: 1, oid: 0, fields: [] });

      const result = await attachmentService.upload(
        {
          originalname: 'policy.pdf',
          buffer: Buffer.from('test'),
          mimetype: 'application/pdf',
          size: 4,
        },
        { type: 'policy', client_id: 'cl1' },
        'u1',
      );

      expect(mockUpload).toHaveBeenCalledOnce();
      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[0]).toMatch(/^attachments\//);
      expect(uploadCall[2]).toBe('application/pdf');

      expect(mockQuery).toHaveBeenCalledOnce();
      const insertValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(insertValues).toContain('policy.pdf');
      expect(insertValues).toContain('application/pdf');
      expect(insertValues).toContain('cl1');
      // storage_key should be stored
      const storageKey = insertValues.find((v) => typeof v === 'string' && (v as string).startsWith('attachments/'));
      expect(storageKey).toBeDefined();

      expect(result.filename).toBe('policy.pdf');
    });

    it('uses "other" type when not supplied', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeAttachment({ type: 'other' })], command: '', rowCount: 1, oid: 0, fields: [] });

      await attachmentService.upload(
        { originalname: 'doc.pdf', buffer: Buffer.from('x'), mimetype: 'application/pdf', size: 1 },
        {},
        'u1',
      );

      const insertValues = mockQuery.mock.calls[0][1] as unknown[];
      expect(insertValues).toContain('other');
    });
  });

  describe('remove', () => {
    it('deletes attachment from DB and calls storage.delete with storage_key', async () => {
      // getById call — includes storage_key
      mockQuery.mockResolvedValueOnce({
        rows: [makeAttachment({ storage_key: 'attachments/policy.pdf' })],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // delete call
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'att1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await attachmentService.remove('att1');
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockDelete).toHaveBeenCalledWith('attachments/policy.pdf');
    });

    it('skips storage delete when storage_key is null', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeAttachment({ storage_key: null })],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'att1' }], command: '', rowCount: 1, oid: 0, fields: [] });

      await attachmentService.remove('att1');
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('throws 404 when attachment not found', async () => {
      mockQuery.mockResolvedValueOnce(emptyResult);
      await expect(attachmentService.remove('nope')).rejects.toThrow('Attachment not found');
    });
  });
});
