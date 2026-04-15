import * as renewalService from '../services/renewal.service';

export async function runRenewalScanner(): Promise<void> {
  try {
    const result = await renewalService.scanUpcomingRenewals();
    console.log(`[RenewalScanner] Scan complete. Notifications sent: ${result.notified}`);
  } catch (error) {
    console.error('[RenewalScanner] Error during renewal scan:', error);
  }
}

// Run daily at midnight when executed directly
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startRenewalScanner(): void {
  if (intervalId) return;
  console.log('[RenewalScanner] Starting daily renewal scanner');
  // Run immediately on start
  void runRenewalScanner();
  intervalId = setInterval(() => {
    void runRenewalScanner();
  }, ONE_DAY_MS);
}

export function stopRenewalScanner(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[RenewalScanner] Stopped');
  }
}
