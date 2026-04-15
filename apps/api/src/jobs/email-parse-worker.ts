import * as emailParserService from '../services/email-parser.service';
import * as emailQueries from '../queries/email.queries';

const PARSE_BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Process emails in the parse queue.
 * Picks up unparsed emails and runs them through AI parsing.
 */
export async function runEmailParseWorker(): Promise<void> {
  try {
    const { rows: emails } = await emailQueries.findParseQueue({
      page: 1,
      limit: PARSE_BATCH_SIZE,
    });

    if (emails.length === 0) return;

    let parsed = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await emailParserService.triggerParse(email.id as string);
        parsed++;
      } catch (error) {
        console.error(`[EmailParseWorker] Failed to parse email ${email.id as string}:`, error);
        failed++;
      }
    }

    console.log(`[EmailParseWorker] Batch complete. Parsed: ${parsed}, Failed: ${failed}`);
  } catch (error) {
    console.error('[EmailParseWorker] Error during worker run:', error);
  }
}

export function startEmailParseWorker(): void {
  if (intervalId) return;
  console.log('[EmailParseWorker] Starting email parse worker');
  void runEmailParseWorker();
  intervalId = setInterval(() => {
    void runEmailParseWorker();
  }, POLL_INTERVAL_MS);
}

export function stopEmailParseWorker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[EmailParseWorker] Stopped');
  }
}
