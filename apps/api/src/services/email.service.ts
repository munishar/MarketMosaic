import * as emailQueries from '../queries/email.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { EmailFilters } from '../queries/email.queries';

export interface EmailListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

/**
 * Send an email: compose from parameters, save to DB, emit event.
 * Uses Azure Communication Services pattern (abstracted for swappability).
 */
export async function sendEmail(
  data: Record<string, unknown>,
  sentByUserId: string,
): Promise<Record<string, unknown>> {
  // Build email record
  const emailData: Record<string, unknown> = {
    direction: 'outbound',
    from_address: data.from_address ?? 'noreply@brokerflow.io',
    to_addresses: data.to_addresses,
    cc_addresses: data.cc_addresses ?? [],
    subject: data.subject,
    body_text: data.body_text,
    body_html: data.body_html ?? null,
    sent_at: new Date().toISOString(),
    client_id: data.client_id ?? null,
    submission_id: data.submission_id ?? null,
    contact_id: data.contact_id ?? null,
    thread_id: data.thread_id ?? null,
    attachments: data.attachments ?? [],
    parse_status: 'unparsed',
    sent_by_user_id: sentByUserId,
    source: 'platform',
  };

  // TODO: Integrate Azure Communication Services for actual email delivery
  // const { EmailClient } = require("@azure/communication-email");
  // const client = new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
  // await client.beginSend({ ... });

  const email = await emailQueries.create(emailData);

  await eventBus.emit('email:sent', {
    email_id: email.id as string,
    submission_id: (email.submission_id as string) ?? undefined,
    contact_id: (email.contact_id as string) ?? undefined,
  });

  return email;
}

/**
 * Save a draft email without sending.
 */
export async function saveDraft(
  data: Record<string, unknown>,
  sentByUserId: string,
): Promise<Record<string, unknown>> {
  const emailData: Record<string, unknown> = {
    direction: 'outbound',
    from_address: data.from_address ?? 'noreply@brokerflow.io',
    to_addresses: data.to_addresses ?? [],
    cc_addresses: data.cc_addresses ?? [],
    subject: data.subject ?? '',
    body_text: data.body_text ?? '',
    body_html: data.body_html ?? null,
    sent_at: new Date().toISOString(),
    client_id: data.client_id ?? null,
    submission_id: data.submission_id ?? null,
    contact_id: data.contact_id ?? null,
    thread_id: data.thread_id ?? null,
    attachments: data.attachments ?? [],
    parse_status: 'unparsed',
    sent_by_user_id: sentByUserId,
    source: 'platform',
  };

  return emailQueries.create(emailData);
}

/**
 * Receive an inbound email via webhook.
 * Auto-links sender to Contact by email, auto-links to Submission by subject/thread.
 */
export async function receiveEmail(
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const fromAddress = data.from_address as string;
  const subject = data.subject as string;
  const threadId = (data.thread_id as string) ?? null;

  // Auto-link sender to contact
  const contact = await emailQueries.findContactByEmail(fromAddress);
  const contactId = contact ? (contact.id as string) : null;

  // Auto-link to submission by subject/thread
  const submission = await emailQueries.findSubmissionBySubjectOrThread(subject, threadId);
  const submissionId = submission ? (submission.id as string) : null;

  const emailData: Record<string, unknown> = {
    direction: 'inbound',
    from_address: fromAddress,
    to_addresses: data.to_addresses ?? [],
    cc_addresses: data.cc_addresses ?? [],
    subject,
    body_text: data.body_text ?? '',
    body_html: data.body_html ?? null,
    sent_at: data.sent_at ?? new Date().toISOString(),
    client_id: data.client_id ?? null,
    submission_id: submissionId,
    contact_id: contactId,
    thread_id: threadId,
    attachments: data.attachments ?? [],
    parse_status: 'unparsed',
    source: data.source ?? 'platform',
    external_message_id: data.external_message_id ?? null,
    import_job_id: data.import_job_id ?? null,
  };

  const email = await emailQueries.create(emailData);

  await eventBus.emit('email:received', {
    email_id: email.id as string,
    contact_id: contactId || undefined,
  });

  return email;
}

/**
 * List inbox (inbound emails).
 */
export async function listInbox(params: ListParams): Promise<EmailListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await emailQueries.findInbox({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

/**
 * Get a thread by thread_id.
 */
export async function getThread(threadId: string): Promise<Record<string, unknown>[]> {
  const emails = await emailQueries.findByThreadId(threadId);
  if (emails.length === 0) throw new AppError(404, 'NOT_FOUND', 'Thread not found');
  return emails;
}

/**
 * Get email by id.
 */
export async function getById(id: string): Promise<Record<string, unknown>> {
  const email = await emailQueries.findById(id);
  if (!email) throw new AppError(404, 'NOT_FOUND', 'Email not found');
  return email;
}

/**
 * List emails with filters and pagination.
 */
export async function list(params: ListParams & EmailFilters): Promise<EmailListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await emailQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

/**
 * List emails in parse queue (unparsed or review_needed).
 */
export async function listParseQueue(params: ListParams): Promise<EmailListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await emailQueries.findParseQueue({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}
