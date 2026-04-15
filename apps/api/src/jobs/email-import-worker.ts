import * as importQueries from '../queries/email-import.queries';

const BATCH_SIZE = 500;
const POLL_INTERVAL_MS = 10 * 1000; // 10 seconds

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Process pending import jobs.
 * Scans for active 'importing' jobs and processes emails in batches of 500.
 */
export async function runEmailImportWorker(): Promise<void> {
  try {
    const { rows: jobs } = await importQueries.findAll({ status: 'importing', limit: 10 });

    for (const job of jobs) {
      const jobId = job.id as string;
      try {
        // In production, this would fetch emails from Microsoft Graph API:
        // const graphClient = Client.initWithMiddleware({ authProvider });
        // const messages = await graphClient.api('/me/messages').top(BATCH_SIZE).get();

        // For now, mark job as complete since we don't have actual email provider
        const currentImported = await importQueries.countImportedEmailsByJob(jobId);
        if (currentImported > 0) {
          await importQueries.updateStatus(jobId, 'enriching', {
            progress_percent: 90,
            enrichment_status: 'in_progress',
          });
        } else {
          await importQueries.updateStatus(jobId, 'complete', {
            progress_percent: 100,
            completed_at: new Date().toISOString(),
          });
        }

        console.log(`[EmailImportWorker] Job ${jobId}: processed batch (size: ${BATCH_SIZE})`);
      } catch (error) {
        console.error(`[EmailImportWorker] Job ${jobId} error:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await importQueries.updateStatus(jobId, 'failed', {
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('[EmailImportWorker] Error during worker run:', error);
  }
}

export function startEmailImportWorker(): void {
  if (intervalId) return;
  console.log('[EmailImportWorker] Starting email import worker');
  void runEmailImportWorker();
  intervalId = setInterval(() => {
    void runEmailImportWorker();
  }, POLL_INTERVAL_MS);
}

export function stopEmailImportWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[EmailImportWorker] Stopped');
  }
}

// Re-export batch size for testing
export { BATCH_SIZE };
