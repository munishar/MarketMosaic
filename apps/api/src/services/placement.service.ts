import * as placementQueries from '../queries/placement.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { PlacementFilters } from '../queries/placement.queries';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['submitted'],
  submitted: ['reviewing'],
  reviewing: ['quoted', 'declined'],
  quoted: ['bound', 'declined', 'expired'],
  bound: [],
  declined: [],
  expired: [],
};

export interface PlacementListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function updateStatus(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown>> {
  const existing = await placementQueries.findTargetById(id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Placement target not found');

  const newStatus = data.status as string;
  const currentStatus = existing.status as string;
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(newStatus)) {
    throw new AppError(
      400,
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from '${currentStatus}' to '${newStatus}'`,
    );
  }

  const updated = await placementQueries.updateTargetStatus(id, data, updatedBy);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Placement target not found');

  await eventBus.emit('placement:statusChanged', {
    target_id: id,
    submission_id: existing.submission_id as string,
    old_status: currentStatus,
    new_status: newStatus,
  });

  return updated;
}

export interface KanbanResult {
  columns: Record<string, Record<string, unknown>[]>;
}

export async function getKanban(): Promise<KanbanResult> {
  const rows = await placementQueries.findKanban();

  const columns: Record<string, Record<string, unknown>[]> = {
    pending: [],
    submitted: [],
    reviewing: [],
    quoted: [],
    bound: [],
    declined: [],
    expired: [],
  };

  for (const row of rows) {
    const status = row.status as string;
    if (columns[status]) {
      columns[status].push(row);
    }
  }

  return { columns };
}

export async function getTimeline(params: ListParams & PlacementFilters): Promise<PlacementListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await placementQueries.findTimeline({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}
