import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailImportService from '../email-import.service';

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

const makeImportJob = (overrides: Record<string, unknown> = {}) => ({
  id: 'j1',
  user_id: 'u1',
  provider: 'import_outlook',
  oauth_token_encrypted: 'encrypted_token',
  date_range_start: '2024-01-01',
  date_range_end: '2025-01-01',
  status: 'connecting',
  total_emails_scanned: 0,
  matched_emails: 0,
  imported_emails: 0,
  matched_contacts: 0,
  enrichment_status: 'pending',
  progress_percent: 0,
  error_message: null,
  started_at: '2025-01-15T10:00:00Z',
  completed_at: null,
  import_report: null,
  excluded_contacts: [],
  incremental_sync_enabled: false,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('EmailImportService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('connectProvider', () => {
    it('creates import job when no active job exists', async () => {
      // findActiveByUserId returns null
      mockQuery.mockResolvedValueOnce(qr([]));
      // create job
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));

      const result = await emailImportService.connectProvider({
        provider: 'import_outlook',
        date_range_start: '2024-01-01',
        date_range_end: '2025-01-01',
      }, 'u1');

      expect(result.id).toBe('j1');
      expect(result.status).toBe('connecting');
    });

    it('throws conflict when active job exists', async () => {
      // findActiveByUserId returns active job
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));

      await expect(emailImportService.connectProvider({
        provider: 'import_outlook',
        date_range_start: '2024-01-01',
        date_range_end: '2025-01-01',
      }, 'u1')).rejects.toThrow('An active import job already exists for this user');
    });
  });

  describe('previewImport', () => {
    it('returns preview with matched contacts', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));
      // getContactEmails
      mockQuery.mockResolvedValueOnce(qr([
        { id: 'ct1', email: 'john@carrier.com', first_name: 'John', last_name: 'Smith' },
        { id: 'ct2', email: 'jane@carrier.com', first_name: 'Jane', last_name: 'Doe' },
      ]));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'previewing', matched_contacts: 2 })]));

      const result = await emailImportService.previewImport('j1');
      expect(result.matched_contacts).toBe(2);
      expect((result.contacts as Array<Record<string, unknown>>)).toHaveLength(2);
    });

    it('throws 404 when job not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.previewImport('nope')).rejects.toThrow('Import job not found');
    });
  });

  describe('startImport', () => {
    it('starts import when job is in connecting status', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'connecting' })]));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'importing', progress_percent: 0 })]));

      const result = await emailImportService.startImport('j1');
      expect(result.status).toBe('importing');
    });

    it('starts import when job is in previewing status', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'previewing' })]));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'importing' })]));

      const result = await emailImportService.startImport('j1');
      expect(result.status).toBe('importing');
    });

    it('throws error when job is in invalid status', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'complete' })]));

      await expect(emailImportService.startImport('j1')).rejects.toThrow('Cannot start import from status: complete');
    });

    it('throws 404 when job not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.startImport('nope')).rejects.toThrow('Import job not found');
    });
  });

  describe('getStatus', () => {
    it('returns job status', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));
      const result = await emailImportService.getStatus('j1');
      expect(result.id).toBe('j1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.getStatus('nope')).rejects.toThrow('Import job not found');
    });
  });

  describe('cancelImport', () => {
    it('cancels active import', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'cancelled' })]));
      const result = await emailImportService.cancelImport('j1');
      expect(result.status).toBe('cancelled');
    });

    it('throws 404 when job not found or already completed', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.cancelImport('nope')).rejects.toThrow('Import job not found or already completed');
    });
  });

  describe('getReport', () => {
    it('returns import report', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({
        status: 'complete',
        total_emails_scanned: 1000,
        matched_emails: 150,
        imported_emails: 150,
      })]));

      const result = await emailImportService.getReport('j1');
      expect(result.total_emails_scanned).toBe(1000);
      expect(result.imported_emails).toBe(150);
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.getReport('nope')).rejects.toThrow('Import job not found');
    });
  });

  describe('purgeImportedData', () => {
    it('purges emails and updates job', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'complete' })]));
      // DELETE emails
      mockQuery.mockResolvedValueOnce(qr([], 25));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ status: 'cancelled', imported_emails: 0 })]));

      const result = await emailImportService.purgeImportedData('j1');
      expect(result.purged_count).toBe(25);
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.purgeImportedData('nope')).rejects.toThrow('Import job not found');
    });
  });

  describe('updateSettings', () => {
    it('updates import settings', async () => {
      // findById
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));
      // updateSettings
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ incremental_sync_enabled: true })]));

      const result = await emailImportService.updateSettings('j1', {
        incremental_sync_enabled: true,
      });
      expect(result.incremental_sync_enabled).toBe(true);
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(emailImportService.updateSettings('nope', {})).rejects.toThrow('Import job not found');
    });
  });

  describe('processImportBatch', () => {
    it('imports matched emails and skips unmatched', async () => {
      // getContactEmails
      mockQuery.mockResolvedValueOnce(qr([
        { id: 'ct1', email: 'john@carrier.com', first_name: 'John', last_name: 'Smith' },
      ]));

      // For matched email: findByExternalMessageId returns empty (no duplicate)
      mockQuery.mockResolvedValueOnce(qr([]));
      // findContactByEmail for matched
      mockQuery.mockResolvedValueOnce(qr([{ id: 'ct1', email: 'john@carrier.com' }]));
      // create email
      mockQuery.mockResolvedValueOnce(qr([{ id: 'e1', contact_id: 'ct1' }]));

      // For unmatched email (no more queries needed since it skips)

      // findById for job update
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ imported_emails: 0, matched_emails: 0 })]));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ imported_emails: 1, matched_emails: 1 })]));

      const result = await emailImportService.processImportBatch('j1', [
        {
          direction: 'inbound',
          from_address: 'john@carrier.com',
          to_addresses: ['broker@marketmosaic.io'],
          subject: 'Quote',
          body_text: 'Quote details',
          sent_at: '2025-01-15T10:00:00Z',
          source: 'import_outlook',
          external_message_id: 'ext1',
        },
        {
          direction: 'inbound',
          from_address: 'unknown@random.com',
          to_addresses: ['broker@marketmosaic.io'],
          subject: 'Spam',
          body_text: 'Spam content',
          sent_at: '2025-01-15T11:00:00Z',
          source: 'import_outlook',
          external_message_id: 'ext2',
        },
      ]);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith('email:imported', {
        job_id: 'j1',
        contact_id: 'ct1',
        email_count: 1,
      });
    });

    it('skips duplicates by external message id', async () => {
      // getContactEmails
      mockQuery.mockResolvedValueOnce(qr([
        { id: 'ct1', email: 'john@carrier.com', first_name: 'John', last_name: 'Smith' },
      ]));

      // findByExternalMessageId returns existing (duplicate)
      mockQuery.mockResolvedValueOnce(qr([{ id: 'existing-email' }]));

      // findById for job update
      mockQuery.mockResolvedValueOnce(qr([makeImportJob({ imported_emails: 0, matched_emails: 0 })]));
      // updateStatus
      mockQuery.mockResolvedValueOnce(qr([makeImportJob()]));

      const result = await emailImportService.processImportBatch('j1', [
        {
          direction: 'inbound',
          from_address: 'john@carrier.com',
          to_addresses: ['broker@marketmosaic.io'],
          subject: 'Duplicate',
          body_text: 'Already imported',
          sent_at: '2025-01-15T10:00:00Z',
          source: 'import_outlook',
          external_message_id: 'existing-ext-id',
        },
      ]);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });
});
