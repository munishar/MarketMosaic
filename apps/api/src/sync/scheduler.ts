import * as syncQueries from '../queries/sync.queries';
import { calculateNextRun } from '../services/sync.service';

const POLL_INTERVAL_MS = 60 * 1000; // 1 minute

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Scheduler that reads sync_schedules table and triggers jobs
 * when their next_run_at time has passed.
 */
export async function runSchedulerTick(): Promise<void> {
  try {
    const dueSchedules = await syncQueries.findDueSchedules();

    for (const schedule of dueSchedules) {
      const scheduleId = schedule.id as string;
      const frequency = schedule.frequency as string;

      try {
        // Create a new sync job for this schedule
        await syncQueries.createJob(
          { schedule_id: scheduleId, job_type: schedule.schedule_type },
          'system',
        );

        // Update next_run_at based on frequency
        const nextRun = calculateNextRun(frequency);
        await syncQueries.updateNextRun(scheduleId, nextRun);

        console.log(`[Scheduler] Triggered job for schedule ${scheduleId}, next run at ${nextRun}`);
      } catch (error) {
        console.error(`[Scheduler] Error triggering schedule ${scheduleId}:`, error);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error during tick:', error);
  }
}

/**
 * Start the scheduler polling loop.
 */
export function startScheduler(): void {
  if (intervalId) return;
  console.log('[Scheduler] Starting sync scheduler...');
  intervalId = setInterval(() => {
    void runSchedulerTick();
  }, POLL_INTERVAL_MS);
  // Don't block process exit
  if (typeof intervalId.unref === 'function') {
    intervalId.unref();
  }
}

/**
 * Stop the scheduler.
 */
export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Scheduler] Stopped sync scheduler');
  }
}
