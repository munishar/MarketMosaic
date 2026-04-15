import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as syncService from '../sync.service';

vi.mock('@brokerflow/db', () => ({ query: vi.fn() }));
vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@brokerflow/shared', () => ({
  SyncFrequency: {
    daily: 'daily',
    weekly: 'weekly',
    biweekly: 'biweekly',
    monthly: 'monthly',
    quarterly: 'quarterly',
    semi_annual: 'semi_annual',
    annual: 'annual',
  },
}));

import { query } from '@brokerflow/db';
import { eventBus } from '../../lib/event-bus';
const mockQuery = vi.mocked(query);
const mockEmit = vi.mocked(eventBus.emit);

const qr = (rows: Record<string, unknown>[] = [], rowCount = rows.length) => ({
  rows, command: '', rowCount, oid: 0, fields: [],
});

const makeSchedule = (overrides: Record<string, unknown> = {}) => ({
  id: 'sch1',
  schedule_type: 'capacity_inquiry',
  frequency: 'monthly',
  next_run_at: '2025-06-01T00:00:00Z',
  last_run_at: null,
  is_active: true,
  config: '{}',
  target_scope: '{}',
  follow_up_config: '{}',
  created_by: 'u1',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

const makeJob = (overrides: Record<string, unknown> = {}) => ({
  id: 'job1',
  schedule_id: 'sch1',
  job_type: 'capacity_inquiry',
  status: 'queued',
  started_at: null,
  completed_at: null,
  records_processed: 0,
  records_updated: 0,
  records_failed: 0,
  error_log: null,
  summary: null,
  triggered_by: 'u1',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

const makeConnection = (overrides: Record<string, unknown> = {}) => ({
  id: 'conn1',
  provider: 'csv_import',
  connection_name: 'Test CSV',
  status: 'connected',
  api_endpoint: null,
  sync_direction: 'inbound',
  last_sync_at: null,
  connection_config: '{}',
  field_mapping: '{}',
  is_active: true,
  created_by: 'u1',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('SyncService', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Schedules ───────────────────────────────────

  describe('listSchedules', () => {
    it('returns paginated schedule list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '2' }]))
        .mockResolvedValueOnce(qr([makeSchedule(), makeSchedule({ id: 'sch2' })]));

      const result = await syncService.listSchedules({});
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.total_pages).toBe(1);
    });
  });

  describe('getScheduleById', () => {
    it('returns schedule when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeSchedule()]));
      const result = await syncService.getScheduleById('sch1');
      expect(result.id).toBe('sch1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.getScheduleById('nope')).rejects.toThrow('Sync schedule not found');
    });
  });

  describe('createSchedule', () => {
    it('creates a schedule', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeSchedule()]));
      const result = await syncService.createSchedule({
        schedule_type: 'capacity_inquiry',
        frequency: 'monthly',
      }, 'u1');
      expect(result.id).toBe('sch1');
    });
  });

  describe('updateSchedule', () => {
    it('updates schedule when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeSchedule()]));
      mockQuery.mockResolvedValueOnce(qr([makeSchedule({ frequency: 'weekly' })]));
      const result = await syncService.updateSchedule('sch1', { frequency: 'weekly' }, 'u1');
      expect(result.frequency).toBe('weekly');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.updateSchedule('nope', { frequency: 'weekly' }, 'u1')).rejects.toThrow('Sync schedule not found');
    });
  });

  describe('deactivateSchedule', () => {
    it('deactivates schedule', async () => {
      mockQuery.mockResolvedValueOnce(qr([{ id: 'sch1' }]));
      await expect(syncService.deactivateSchedule('sch1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.deactivateSchedule('nope')).rejects.toThrow('Sync schedule not found');
    });
  });

  describe('triggerSchedule', () => {
    it('creates a job for the schedule', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeSchedule()]));
      mockQuery.mockResolvedValueOnce(qr([makeJob()]));
      const result = await syncService.triggerSchedule('sch1', 'u1');
      expect(result.id).toBe('job1');
      expect(result.schedule_id).toBe('sch1');
    });

    it('throws 404 when schedule not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.triggerSchedule('nope', 'u1')).rejects.toThrow('Sync schedule not found');
    });
  });

  // ─── Jobs ────────────────────────────────────────

  describe('listJobs', () => {
    it('returns paginated job list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeJob()]));

      const result = await syncService.listJobs({});
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getJobById', () => {
    it('returns job when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeJob()]));
      const result = await syncService.getJobById('job1');
      expect(result.id).toBe('job1');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.getJobById('nope')).rejects.toThrow('Sync job not found');
    });
  });

  describe('cancelJob', () => {
    it('cancels a queued job', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeJob({ status: 'queued' })]));
      mockQuery.mockResolvedValueOnce(qr([makeJob({ status: 'cancelled' })]));
      const result = await syncService.cancelJob('job1');
      expect(result.status).toBe('cancelled');
    });

    it('cancels a running job', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeJob({ status: 'running' })]));
      mockQuery.mockResolvedValueOnce(qr([makeJob({ status: 'cancelled' })]));
      const result = await syncService.cancelJob('job1');
      expect(result.status).toBe('cancelled');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.cancelJob('nope')).rejects.toThrow('Sync job not found');
    });

    it('throws validation error for completed jobs', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeJob({ status: 'complete' })]));
      await expect(syncService.cancelJob('job1')).rejects.toThrow('Only queued or running jobs can be cancelled');
    });
  });

  // ─── AMS Connections ─────────────────────────────

  describe('listConnections', () => {
    it('returns paginated connection list', async () => {
      mockQuery
        .mockResolvedValueOnce(qr([{ total: '1' }]))
        .mockResolvedValueOnce(qr([makeConnection()]));

      const result = await syncService.listConnections({});
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createConnection', () => {
    it('creates a connection', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeConnection()]));
      const result = await syncService.createConnection({
        provider: 'csv_import',
        connection_name: 'Test CSV',
        sync_direction: 'inbound',
      }, 'u1');
      expect(result.id).toBe('conn1');
    });
  });

  describe('updateConnection', () => {
    it('updates connection when found', async () => {
      mockQuery.mockResolvedValueOnce(qr([makeConnection()]));
      mockQuery.mockResolvedValueOnce(qr([makeConnection({ connection_name: 'Updated' })]));
      const result = await syncService.updateConnection('conn1', { connection_name: 'Updated' }, 'u1');
      expect(result.connection_name).toBe('Updated');
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.updateConnection('nope', {}, 'u1')).rejects.toThrow('AMS connection not found');
    });
  });

  describe('testConnection', () => {
    it('tests a connection', async () => {
      // findConnectionById
      mockQuery.mockResolvedValueOnce(qr([makeConnection()]));
      // updateConnectionStatus (testing)
      mockQuery.mockResolvedValueOnce(qr([makeConnection({ status: 'testing' })]));
      // updateConnectionStatus (connected)
      mockQuery.mockResolvedValueOnce(qr([makeConnection({ status: 'connected' })]));

      const result = await syncService.testConnection('conn1');
      expect(result.status).toBe('connected');
      expect((result.test_result as Record<string, unknown>).success).toBe(true);
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.testConnection('nope')).rejects.toThrow('AMS connection not found');
    });
  });

  describe('deactivateConnection', () => {
    it('deactivates connection', async () => {
      mockQuery.mockResolvedValueOnce(qr([{ id: 'conn1' }]));
      await expect(syncService.deactivateConnection('conn1')).resolves.toBeUndefined();
    });

    it('throws 404 when not found', async () => {
      mockQuery.mockResolvedValueOnce(qr([]));
      await expect(syncService.deactivateConnection('nope')).rejects.toThrow('AMS connection not found');
    });
  });

  // ─── Reconciliation ─────────────────────────────

  describe('runReconciliation', () => {
    it('returns reconciliation results', async () => {
      mockQuery.mockResolvedValueOnce(qr([
        { id: 'st1', policy_number: null, client_name: 'Acme', carrier_name: 'Hartford' },
        { id: 'st2', policy_number: 'POL-123', client_name: 'Beta LLC', carrier_name: 'Travelers' },
      ]));

      const result = await syncService.runReconciliation('job1');
      expect(result.total_checked).toBe(2);
      expect(result.mismatches_found).toBe(1);
      expect(mockEmit).toHaveBeenCalledWith('sync:reconciliationMismatch', {
        job_id: 'job1',
        entity_type: 'submission_target',
        entity_id: 'st1',
      });
    });

    it('returns no mismatches when all have policy numbers', async () => {
      mockQuery.mockResolvedValueOnce(qr([
        { id: 'st1', policy_number: 'POL-001', client_name: 'Acme', carrier_name: 'Hartford' },
      ]));

      const result = await syncService.runReconciliation('job1');
      expect(result.total_checked).toBe(1);
      expect(result.mismatches_found).toBe(0);
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  // ─── calculateNextRun ────────────────────────────

  describe('calculateNextRun', () => {
    it('calculates daily next run', () => {
      const result = syncService.calculateNextRun('daily');
      const next = new Date(result);
      const now = new Date();
      const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThan(23);
      expect(diffHours).toBeLessThan(25);
    });

    it('calculates weekly next run', () => {
      const result = syncService.calculateNextRun('weekly');
      const next = new Date(result);
      const now = new Date();
      const diffDays = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(6);
      expect(diffDays).toBeLessThan(8);
    });

    it('defaults to daily for unknown frequency', () => {
      const result = syncService.calculateNextRun('unknown');
      const next = new Date(result);
      const now = new Date();
      const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThan(23);
      expect(diffHours).toBeLessThan(25);
    });
  });
});
