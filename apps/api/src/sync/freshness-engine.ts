import { calculateFreshnessScore, getFreshnessStatus } from '../services/freshness.service';
import * as freshnessQueries from '../queries/freshness.queries';
import { eventBus } from '../lib/event-bus';

const STALENESS_THRESHOLD_DAYS = 90;
const STALE_SCORE_THRESHOLD = 30;

/**
 * Freshness score calculator.
 * Recalculates freshness scores for all entities and emits events for stale data.
 */
export async function recalculateAllScores(
  stalenessThresholdDays: number = STALENESS_THRESHOLD_DAYS,
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

/**
 * Calculate freshness for a single entity.
 */
export function calculateEntityFreshness(
  lastVerifiedAt: string | Date | null,
  stalenessThresholdDays: number = STALENESS_THRESHOLD_DAYS,
): { score: number; status: string } {
  const score = calculateFreshnessScore(lastVerifiedAt, stalenessThresholdDays);
  const status = getFreshnessStatus(score);
  return { score, status };
}
