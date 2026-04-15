import * as teamQueries from '../queries/team.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';

export interface TeamListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & { region?: string }): Promise<TeamListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await teamQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const team = await teamQueries.findById(id);
  if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');
  return team;
}

export async function getMembers(teamId: string, params: ListParams): Promise<TeamListResult> {
  await getById(teamId); // verify team exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await teamQueries.findMembers(teamId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  return teamQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const team = await teamQueries.update(id, data, updatedBy);
  if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');
  return team;
}

export async function remove(id: string): Promise<void> {
  const success = await teamQueries.remove(id);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Team not found');
}
