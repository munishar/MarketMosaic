import * as importQueries from '../queries/email-import.queries';
import * as emailQueries from '../queries/email.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';

export interface ImportListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

/**
 * Connect to email provider via OAuth (Microsoft Graph API).
 * Creates a new import job in 'connecting' status.
 */
export async function connectProvider(
  data: Record<string, unknown>,
  userId: string,
): Promise<Record<string, unknown>> {
  // Check if user already has an active import
  const activeJob = await importQueries.findActiveByUserId(userId);
  if (activeJob) {
    throw new AppError(409, 'CONFLICT', 'An active import job already exists for this user');
  }

  const job = await importQueries.create({
    user_id: userId,
    provider: data.provider,
    oauth_token_encrypted: data.oauth_token ?? '',
    date_range_start: data.date_range_start,
    date_range_end: data.date_range_end,
    excluded_contacts: data.excluded_contacts ?? [],
    incremental_sync_enabled: data.incremental_sync_enabled ?? false,
    status: 'connecting',
  });

  return job;
}

/**
 * Preview matched emails before starting import.
 * Scans contact emails in DB and returns match counts.
 */
export async function previewImport(jobId: string): Promise<Record<string, unknown>> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');

  // Get all contacts with emails from DB
  const contacts = await importQueries.getContactEmails();

  // In production, this would query Microsoft Graph API to scan the user's mailbox
  // and match against contact emails. For now, return preview data.
  const matchedContacts = contacts.length;

  await importQueries.updateStatus(jobId, 'previewing', {
    matched_contacts: matchedContacts,
  });

  return {
    job_id: jobId,
    status: 'previewing',
    matched_contacts: matchedContacts,
    contacts: contacts.map((c) => ({
      id: c.id,
      name: `${c.first_name as string} ${c.last_name as string}`,
      email: c.email,
    })),
  };
}

/**
 * Start the email import process.
 * Transitions job to 'importing' and kicks off the background worker.
 */
export async function startImport(jobId: string): Promise<Record<string, unknown>> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');

  if (!['connecting', 'previewing'].includes(job.status as string)) {
    throw new AppError(400, 'INVALID_STATUS', `Cannot start import from status: ${job.status as string}`);
  }

  const updated = await importQueries.updateStatus(jobId, 'importing', {
    progress_percent: 0,
  });

  return updated ?? job;
}

/**
 * Get current import status.
 */
export async function getStatus(jobId: string): Promise<Record<string, unknown>> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');
  return job;
}

/**
 * Cancel an active import job.
 */
export async function cancelImport(jobId: string): Promise<Record<string, unknown>> {
  const cancelled = await importQueries.cancel(jobId);
  if (!cancelled) throw new AppError(404, 'NOT_FOUND', 'Import job not found or already completed');
  return cancelled;
}

/**
 * Get import report for a completed job.
 */
export async function getReport(jobId: string): Promise<Record<string, unknown>> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');
  return {
    job_id: jobId,
    status: job.status,
    total_emails_scanned: job.total_emails_scanned,
    matched_emails: job.matched_emails,
    imported_emails: job.imported_emails,
    matched_contacts: job.matched_contacts,
    enrichment_status: job.enrichment_status,
    started_at: job.started_at,
    completed_at: job.completed_at,
    import_report: job.import_report,
  };
}

/**
 * Purge all imported emails for a given job.
 */
export async function purgeImportedData(jobId: string): Promise<{ purged_count: number }> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');

  const purgedCount = await importQueries.purgeImportedEmails(jobId);

  await importQueries.updateStatus(jobId, 'cancelled', {
    imported_emails: 0,
    import_report: { purged: true, purged_count: purgedCount, purged_at: new Date().toISOString() },
  });

  return { purged_count: purgedCount };
}

/**
 * Update import settings for a job.
 */
export async function updateSettings(
  jobId: string,
  settings: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const job = await importQueries.findById(jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Import job not found');

  const updated = await importQueries.updateSettings(jobId, settings);
  return updated ?? job;
}

/**
 * List all import jobs with pagination.
 */
export async function listJobs(
  params: ListParams & { user_id?: string; status?: string },
): Promise<ImportListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await importQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

/**
 * Process a batch of emails for import (called by background worker).
 * Matches sender/recipient against Contact.email in DB.
 * Only imports matched emails.
 */
export async function processImportBatch(
  jobId: string,
  rawEmails: Array<Record<string, unknown>>,
): Promise<{ imported: number; skipped: number }> {
  const contacts = await importQueries.getContactEmails();
  const contactEmailSet = new Set(
    contacts.filter((c) => c.email).map((c) => (c.email as string).toLowerCase()),
  );

  let imported = 0;
  let skipped = 0;

  for (const rawEmail of rawEmails) {
    const from = (rawEmail.from_address as string).toLowerCase();
    const to = (rawEmail.to_addresses as string[]).map((e) => e.toLowerCase());
    const allAddresses = [from, ...to];
    const isMatch = allAddresses.some((addr) => contactEmailSet.has(addr));

    if (!isMatch) {
      skipped++;
      continue;
    }

    // Check for duplicate by external message ID
    const externalId = rawEmail.external_message_id as string | undefined;
    if (externalId) {
      const existing = await emailQueries.findByExternalMessageId(externalId);
      if (existing) {
        skipped++;
        continue;
      }
    }

    // Find matching contact
    const contact = await emailQueries.findContactByEmail(from);

    await emailQueries.create({
      ...rawEmail,
      contact_id: contact ? contact.id : null,
      import_job_id: jobId,
      parse_status: 'unparsed',
    });

    if (contact) {
      await eventBus.emit('email:imported', {
        job_id: jobId,
        contact_id: contact.id as string,
        email_count: 1,
      });
    }

    imported++;
  }

  // Update job progress
  const job = await importQueries.findById(jobId);
  if (job) {
    const totalImported = (job.imported_emails as number) + imported;
    const totalMatched = (job.matched_emails as number) + imported;
    await importQueries.updateStatus(jobId, 'importing', {
      imported_emails: totalImported,
      matched_emails: totalMatched,
    });
  }

  return { imported, skipped };
}
