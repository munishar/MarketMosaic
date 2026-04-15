import * as submissionQueries from '../queries/submission.queries';
import * as placementQueries from '../queries/placement.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';

const DEFAULT_WINDOWS = [120, 90, 60, 30];

export interface RenewalListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams): Promise<RenewalListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await submissionQueries.findAll({
    ...params,
    page,
    limit,
  });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export interface UpcomingRenewal {
  submission: Record<string, unknown>;
  days_until_expiry: number;
  window: number;
}

export async function getUpcoming(windows?: number[]): Promise<{ data: UpcomingRenewal[] }> {
  const dayWindows = windows ?? DEFAULT_WINDOWS;
  const sorted = [...dayWindows].sort((a, b) => b - a);
  const renewals = await submissionQueries.findUpcomingRenewals(sorted);

  const now = new Date();
  const results: UpcomingRenewal[] = [];

  for (const submission of renewals) {
    const expirationDate = new Date(submission.expiration_date as string);
    const diffMs = expirationDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let matchedWindow = sorted[0];
    for (const w of sorted) {
      if (daysUntilExpiry <= w) {
        matchedWindow = w;
      }
    }

    results.push({
      submission,
      days_until_expiry: daysUntilExpiry,
      window: matchedWindow,
    });
  }

  return { data: results };
}

export async function initiate(id: string, createdBy: string): Promise<Record<string, unknown>> {
  const original = await submissionQueries.findById(id);
  if (!original) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

  const newSubmission = await submissionQueries.create({
    client_id: original.client_id,
    effective_date: original.expiration_date,
    expiration_date: addOneYear(original.expiration_date as string),
    lines_requested: typeof original.lines_requested === 'string'
      ? JSON.parse(original.lines_requested as string)
      : original.lines_requested,
    notes: `Renewal of submission ${id}`,
    priority: original.priority ?? 'normal',
    renewal_of: id,
  }, createdBy);

  await eventBus.emit('submission:created', {
    submission_id: newSubmission.id as string,
    client_id: newSubmission.client_id as string,
    created_by: createdBy,
  });

  return newSubmission;
}

export async function scanUpcomingRenewals(): Promise<{ notified: number }> {
  const dayWindows = DEFAULT_WINDOWS;
  const renewals = await submissionQueries.findUpcomingRenewals(dayWindows);

  const now = new Date();
  let notified = 0;

  for (const submission of renewals) {
    const expirationDate = new Date(submission.expiration_date as string);
    const diffMs = expirationDate.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const matchesWindow = dayWindows.some((w) => daysUntilExpiry === w);
    if (!matchesWindow) continue;

    await placementQueries.createNotification({
      user_id: submission.created_by as string,
      type: 'renewal_upcoming',
      title: `Renewal Due in ${daysUntilExpiry} Days`,
      message: `Submission for ${submission.client_name as string} expires on ${submission.expiration_date as string}`,
      action_url: `/submissions/${submission.id as string}`,
    });

    await eventBus.emit('renewal:upcoming', {
      submission_id: submission.id as string,
      client_id: submission.client_id as string,
      days_until_expiry: daysUntilExpiry,
    });

    notified++;
  }

  return { notified };
}

function addOneYear(dateStr: string): string {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}
