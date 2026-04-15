import { recalculateAllScores } from '../sync/freshness-engine';

const DECAY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Freshness decay job.
 * Periodically recalculates freshness scores for all entities.
 * Emits sync:dataStale events for records below the threshold.
 */
export async function runFreshnessDecay(): Promise<void> {
  try {
    const result = await recalculateAllScores();
    console.log(`[FreshnessDecay] Processed ${result.processed} records, ${result.stale_count} stale`);
  } catch (error) {
    console.error('[FreshnessDecay] Error during decay calculation:', error);
  }
}

/**
 * Start the freshness decay polling loop.
 */
export function startFreshnessDecay(): void {
  if (intervalId) return;
  console.log('[FreshnessDecay] Starting freshness decay job...');
  intervalId = setInterval(() => {
    void runFreshnessDecay();
  }, DECAY_INTERVAL_MS);
  if (typeof intervalId.unref === 'function') {
    intervalId.unref();
  }
}

/**
 * Stop the freshness decay job.
 */
export function stopFreshnessDecay(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[FreshnessDecay] Stopped freshness decay job');
  }
}
