import * as formQueries from '../queries/form.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';

export interface FormListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & { carrier_id?: string; line_of_business_id?: string }): Promise<FormListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await formQueries.findAll({ ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const form = await formQueries.findById(id);
  if (!form) {
    throw new AppError(404, 'NOT_FOUND', 'Form/paper not found');
  }
  return form;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  return formQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const form = await formQueries.update(id, data, updatedBy);
  if (!form) {
    throw new AppError(404, 'NOT_FOUND', 'Form/paper not found');
  }
  return form;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await formQueries.deactivate(id, updatedBy);
  if (!success) {
    throw new AppError(404, 'NOT_FOUND', 'Form/paper not found');
  }
}
