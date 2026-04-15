import * as syncQueries from '../queries/sync.queries';
import { createAdapter } from '../sync/adapters/index';
import type { AMSConnectionConfig, DateRange } from '../sync/ams-adapter';

const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Process queued sync jobs.
 * Picks up jobs with status 'queued', runs them, and updates status.
 */
export async function processSyncJobs(): Promise<void> {
  try {
    const { rows: jobs } = await syncQueries.findAllJobs({ status: 'queued', limit: 5 });

    for (const job of jobs) {
      const jobId = job.id as string;
      const jobType = job.job_type as string;

      try {
        // Mark as running
        await syncQueries.updateJobStatus(jobId, 'running');

        let result: Record<string, unknown>;

        switch (jobType) {
          case 'ams_sync':
            result = await processAMSSync(job);
            break;
          case 'capacity_inquiry':
            result = await processCapacityInquiry(job);
            break;
          case 'manual_refresh':
            result = await processManualRefresh(job);
            break;
          default:
            result = { message: `Unknown job type: ${jobType}` };
        }

        await syncQueries.updateJobStatus(jobId, 'complete', {
          records_processed: (result.records_processed as number) ?? 0,
          records_updated: (result.records_updated as number) ?? 0,
          records_failed: (result.records_failed as number) ?? 0,
          summary: result,
        });

        console.log(`[SyncWorker] Job ${jobId} (${jobType}) completed`);
      } catch (error) {
        console.error(`[SyncWorker] Job ${jobId} failed:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await syncQueries.updateJobStatus(jobId, 'failed', {
          records_processed: 0,
          records_updated: 0,
          records_failed: 0,
          error_log: [{ timestamp: new Date().toISOString(), message: errorMessage }],
          summary: { error: errorMessage },
        });
      }
    }
  } catch (error) {
    console.error('[SyncWorker] Error during job processing:', error);
  }
}

async function processAMSSync(job: Record<string, unknown>): Promise<Record<string, unknown>> {
  const scheduleId = job.schedule_id as string | null;
  if (!scheduleId) {
    return { records_processed: 0, records_updated: 0, records_failed: 0, message: 'No schedule associated' };
  }

  // Look up AMS connections to determine which adapter to use
  const { rows: connections } = await syncQueries.findAllConnections({ limit: 100 });
  const activeConnections = connections.filter((c) => c.status === 'connected');

  let totalProcessed = 0;
  let totalUpdated = 0;

  for (const connection of activeConnections) {
    const provider = connection.provider as string;
    const adapter = createAdapter(provider);

    try {
      await adapter.connect(connection.connection_config as AMSConnectionConfig ?? {});

      const dateRange: DateRange = {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      };

      const policies = await adapter.pullPolicies(dateRange);
      totalProcessed += policies.length;
      totalUpdated += policies.length;

      await adapter.disconnect();
    } catch (error) {
      console.error(`[SyncWorker] AMS sync error for ${provider}:`, error);
    }
  }

  return { records_processed: totalProcessed, records_updated: totalUpdated, records_failed: 0 };
}

async function processCapacityInquiry(_job: Record<string, unknown>): Promise<Record<string, unknown>> {
  // In production: generate and send capacity inquiry emails
  return { records_processed: 0, records_updated: 0, records_failed: 0, message: 'Capacity inquiry processing placeholder' };
}

async function processManualRefresh(_job: Record<string, unknown>): Promise<Record<string, unknown>> {
  // In production: refresh specified entity data
  return { records_processed: 0, records_updated: 0, records_failed: 0, message: 'Manual refresh processing placeholder' };
}

/**
 * Start the sync worker polling loop.
 */
export function startSyncWorker(): void {
  if (intervalId) return;
  console.log('[SyncWorker] Starting sync worker...');
  intervalId = setInterval(() => {
    void processSyncJobs();
  }, POLL_INTERVAL_MS);
  if (typeof intervalId.unref === 'function') {
    intervalId.unref();
  }
}

/**
 * Stop the sync worker.
 */
export function stopSyncWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[SyncWorker] Stopped sync worker');
  }
}
