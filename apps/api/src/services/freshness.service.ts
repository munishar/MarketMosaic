import * as freshnessQueries from '../queries/freshness.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { FreshnessFilters } from '../queries/freshness.queries';
import { DataFreshnessStatus } from '@marketmosaic/shared';

export interface FreshnessListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

const DEFAULT_STALENESS_THRESHOLD_DAYS = 90;
const STALE_SCORE_THRESHOLD = 30;

/**
 * Calculate freshness score based on days since last verification.
 * Formula: max(0, 100 * (1 - (days_since_verification / staleness_threshold_days)))
 */
export function calculateFreshnessScore(
  lastVerifiedAt: string | Date | null,
  stalenessThresholdDays: number = DEFAULT_STALENESS_THRESHOLD_DAYS,
): number {
  if (!lastVerifiedAt) return 0;
  const lastVerified = new Date(lastVerifiedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastVerified.getTime();
  const daysSinceVerification = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(100 * (1 - daysSinceVerification / stalenessThresholdDays)));
}

/**
 * Determine freshness status from score.
 */
export function getFreshnessStatus(score: number): DataFreshnessStatus {
  if (score >= 70) return DataFreshnessStatus.fresh;
  if (score >= 30) return DataFreshnessStatus.aging;
  return DataFreshnessStatus.stale;
}

export async function list(params: ListParams & FreshnessFilters): Promise<FreshnessListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await freshnessQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getByEntity(entityType: string, entityId: string): Promise<Record<string, unknown>> {
  const record = await freshnessQueries.findByEntity(entityType, entityId);
  if (!record) throw new AppError(404, 'NOT_FOUND', 'Freshness record not found');
  return record;
}

export async function refreshEntity(
  entityType: string,
  entityId: string,
  verifiedBy: string,
  verificationSource: string = 'manual',
): Promise<Record<string, unknown>> {
  const score = 100; // Just verified, so fully fresh
  const status = DataFreshnessStatus.fresh;
  const record = await freshnessQueries.upsertScore(
    entityType, entityId, score, status, verifiedBy, verificationSource,
  );
  return record;
}

/**
 * Recalculate freshness scores for all records.
 * Emits sync:dataStale for any record falling below the stale threshold.
 */
export async function recalculateAll(
  stalenessThresholdDays: number = DEFAULT_STALENESS_THRESHOLD_DAYS,
): Promise<{ processed: number; stale_count: number }> {
  const records = await freshnessQueries.findAllForDecay();
  let staleCount = 0;

  for (const record of records) {
    const score = calculateFreshnessScore(
      record.last_verified_at as string | null,
      stalenessThresholdDays,
    );
    const status = getFreshnessStatus(score);

    await freshnessQueries.updateScore(record.id as string, score, status);

    if (score < STALE_SCORE_THRESHOLD) {
      staleCount++;
      await eventBus.emit('sync:dataStale', {
        entity_type: record.entity_type as string,
        entity_id: record.entity_id as string,
        freshness_score: score,
      });
    }
  }

  return { processed: records.length, stale_count: staleCount };
}

export async function markRefreshPending(entityType: string, entityId: string): Promise<Record<string, unknown>> {
  const record = await freshnessQueries.markRefreshPending(entityType, entityId);
  if (!record) throw new AppError(404, 'NOT_FOUND', 'Freshness record not found');
  return record;
}
