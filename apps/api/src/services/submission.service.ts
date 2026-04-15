import * as submissionQueries from '../queries/submission.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { SubmissionFilters } from '../queries/submission.queries';

export interface SubmissionListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & SubmissionFilters): Promise<SubmissionListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await submissionQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const { submission, targets } = await submissionQueries.findByIdWithTargets(id);
  if (!submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  return { ...submission, targets };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const submission = await submissionQueries.create(data, createdBy);
  await eventBus.emit('submission:created', {
    submission_id: submission.id as string,
    client_id: submission.client_id as string,
    created_by: createdBy,
  });
  return submission;
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const existing = await submissionQueries.findById(id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  const submission = await submissionQueries.update(id, data, updatedBy);
  if (!submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  return submission;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await submissionQueries.deactivate(id, updatedBy);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
}

export async function addTarget(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const submission = await submissionQueries.findById(data.submission_id as string);
  if (!submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  const target = await submissionQueries.createTarget(data, createdBy);
  return target;
}

export async function send(id: string, updatedBy: string): Promise<Record<string, unknown>> {
  const submission = await submissionQueries.findById(id);
  if (!submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

  const targets = await submissionQueries.findTargetsBySubmissionId(id);
  if (targets.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Submission must have at least one target before sending');
  }

  const updated = await submissionQueries.update(id, {
    status: 'submitted',
    submission_date: new Date().toISOString(),
  }, updatedBy);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

  const sentTargets = await submissionQueries.markTargetsAsSent(id);
  const targetIds = sentTargets.map((t) => t.id as string);

  await eventBus.emit('submission:sent', {
    submission_id: id,
    target_ids: targetIds,
  });

  return { ...updated, targets: sentTargets };
}
