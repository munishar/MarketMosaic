import * as userQueries from '../queries/user.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';

export interface UserListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & { role?: string; team_id?: string; region?: string }): Promise<UserListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await userQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const user = await userQueries.findById(id);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  // Check for duplicate email
  const existing = await userQueries.findByEmail(data.email as string);
  if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'A user with this email already exists');
  return userQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  // Check email uniqueness if changing email
  if (data.email) {
    const existing = await userQueries.findByEmail(data.email as string);
    if (existing && (existing.id as string) !== id) {
      throw new AppError(409, 'EMAIL_EXISTS', 'A user with this email already exists');
    }
  }
  const user = await userQueries.update(id, data, updatedBy);
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await userQueries.deactivate(id, updatedBy);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'User not found');
}
