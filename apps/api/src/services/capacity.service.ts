import * as capacityQueries from '../queries/capacity.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';
import type { CapacitySearchParams } from '../queries/capacity.queries';

export interface CapacityListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & { carrier_id?: string; line_of_business_id?: string; contact_id?: string }): Promise<CapacityListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await capacityQueries.findAll({ ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const capacity = await capacityQueries.findById(id);
  if (!capacity) {
    throw new AppError(404, 'NOT_FOUND', 'Capacity record not found');
  }
  return capacity;
}

export async function search(params: CapacitySearchParams): Promise<CapacityListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await capacityQueries.search({ ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  return capacityQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const capacity = await capacityQueries.update(id, data, updatedBy);
  if (!capacity) {
    throw new AppError(404, 'NOT_FOUND', 'Capacity record not found');
  }
  return capacity;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await capacityQueries.deactivate(id, updatedBy);
  if (!success) {
    throw new AppError(404, 'NOT_FOUND', 'Capacity record not found');
  }
}
