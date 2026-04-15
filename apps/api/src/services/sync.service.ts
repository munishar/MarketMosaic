import * as syncQueries from '../queries/sync.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { ScheduleFilters, JobFilters, ConnectionFilters } from '../queries/sync.queries';
import { SyncFrequency } from '@marketmosaic/shared';

export interface SyncListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

// ─── Schedules ───────────────────────────────────────

export async function listSchedules(params: ListParams & ScheduleFilters): Promise<SyncListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await syncQueries.findAllSchedules({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getScheduleById(id: string): Promise<Record<string, unknown>> {
  const schedule = await syncQueries.findScheduleById(id);
  if (!schedule) throw new AppError(404, 'NOT_FOUND', 'Sync schedule not found');
  return schedule;
}

export async function createSchedule(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const schedule = await syncQueries.createSchedule(data, createdBy);
  return schedule;
}

export async function updateSchedule(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const existing = await syncQueries.findScheduleById(id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Sync schedule not found');
  const updated = await syncQueries.updateSchedule(id, data, updatedBy);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Sync schedule not found');
  return updated;
}

export async function deactivateSchedule(id: string): Promise<void> {
  const success = await syncQueries.deactivateSchedule(id);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Sync schedule not found');
}

export async function triggerSchedule(id: string, triggeredBy: string): Promise<Record<string, unknown>> {
  const schedule = await syncQueries.findScheduleById(id);
  if (!schedule) throw new AppError(404, 'NOT_FOUND', 'Sync schedule not found');

  const job = await syncQueries.createJob(
    { schedule_id: id, job_type: schedule.schedule_type },
    triggeredBy,
  );

  return job;
}

/**
 * Calculate the next run date based on frequency.
 */
export function calculateNextRun(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case SyncFrequency.daily:
      now.setDate(now.getDate() + 1);
      break;
    case SyncFrequency.weekly:
      now.setDate(now.getDate() + 7);
      break;
    case SyncFrequency.biweekly:
      now.setDate(now.getDate() + 14);
      break;
    case SyncFrequency.monthly:
      now.setMonth(now.getMonth() + 1);
      break;
    case SyncFrequency.quarterly:
      now.setMonth(now.getMonth() + 3);
      break;
    case SyncFrequency.semi_annual:
      now.setMonth(now.getMonth() + 6);
      break;
    case SyncFrequency.annual:
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  return now.toISOString();
}

// ─── Jobs ────────────────────────────────────────────

export async function listJobs(params: ListParams & JobFilters): Promise<SyncListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await syncQueries.findAllJobs({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getJobById(id: string): Promise<Record<string, unknown>> {
  const job = await syncQueries.findJobById(id);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Sync job not found');
  return job;
}

export async function cancelJob(id: string): Promise<Record<string, unknown>> {
  const job = await syncQueries.findJobById(id);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Sync job not found');

  if (job.status !== 'queued' && job.status !== 'running') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Only queued or running jobs can be cancelled');
  }

  const updated = await syncQueries.updateJobStatus(id, 'cancelled');
  if (!updated) throw new AppError(500, 'INTERNAL_ERROR', 'Failed to cancel job');
  return updated;
}

// ─── AMS Connections ─────────────────────────────────

export async function listConnections(params: ListParams & ConnectionFilters): Promise<SyncListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await syncQueries.findAllConnections({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getConnectionById(id: string): Promise<Record<string, unknown>> {
  const connection = await syncQueries.findConnectionById(id);
  if (!connection) throw new AppError(404, 'NOT_FOUND', 'AMS connection not found');
  return connection;
}

export async function createConnection(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const connection = await syncQueries.createConnection(data, createdBy);
  return connection;
}

export async function updateConnection(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const existing = await syncQueries.findConnectionById(id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'AMS connection not found');
  const updated = await syncQueries.updateConnection(id, data, updatedBy);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'AMS connection not found');
  return updated;
}

export async function testConnection(id: string): Promise<Record<string, unknown>> {
  const connection = await syncQueries.findConnectionById(id);
  if (!connection) throw new AppError(404, 'NOT_FOUND', 'AMS connection not found');

  // Mark as testing
  await syncQueries.updateConnectionStatus(id, 'testing');

  // Simulate connection test — in production this would call the adapter
  const testResult = {
    success: true,
    latency_ms: 42,
    tested_at: new Date().toISOString(),
  };

  await syncQueries.updateConnectionStatus(id, 'connected');
  return { ...connection, status: 'connected', test_result: testResult };
}

export async function deactivateConnection(id: string): Promise<void> {
  const success = await syncQueries.deactivateConnection(id);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'AMS connection not found');
}

// ─── Reconciliation ──────────────────────────────────

export async function runReconciliation(jobId: string): Promise<Record<string, unknown>> {
  const boundTargets = await syncQueries.findBoundSubmissionTargets();
  const mismatches: Record<string, unknown>[] = [];

  // In production, this would compare against AMS policy data
  // For now, flag any bound target without a policy_number as a potential mismatch
  for (const target of boundTargets) {
    if (!target.policy_number) {
      mismatches.push({
        entity_type: 'submission_target',
        entity_id: target.id,
        reason: 'No policy number found for bound submission target',
        client_name: target.client_name,
        carrier_name: target.carrier_name,
      });

      await eventBus.emit('sync:reconciliationMismatch', {
        job_id: jobId,
        entity_type: 'submission_target',
        entity_id: target.id as string,
      });
    }
  }

  return {
    total_checked: boundTargets.length,
    mismatches_found: mismatches.length,
    mismatches,
  };
}
