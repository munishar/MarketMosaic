import * as lineQueries from '../queries/line.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';

export interface LineListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams): Promise<LineListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await lineQueries.findAll({ ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const line = await lineQueries.findById(id);
  if (!line) {
    throw new AppError(404, 'NOT_FOUND', 'Line of business not found');
  }
  return line;
}

export async function getChildren(parentId: string): Promise<Record<string, unknown>[]> {
  await getById(parentId); // verify parent exists
  return lineQueries.findChildren(parentId);
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  // Validate parent exists if provided
  if (data.parent_line_id) {
    const parent = await lineQueries.findById(data.parent_line_id as string);
    if (!parent) {
      throw new AppError(400, 'INVALID_PARENT', 'Parent line of business not found');
    }
  }
  return lineQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  // Prevent circular reference
  if (data.parent_line_id && data.parent_line_id === id) {
    throw new AppError(400, 'CIRCULAR_REFERENCE', 'A line of business cannot be its own parent');
  }
  // Validate parent exists if changing parent
  if (data.parent_line_id) {
    const parent = await lineQueries.findById(data.parent_line_id as string);
    if (!parent) {
      throw new AppError(400, 'INVALID_PARENT', 'Parent line of business not found');
    }
  }
  const line = await lineQueries.update(id, data, updatedBy);
  if (!line) {
    throw new AppError(404, 'NOT_FOUND', 'Line of business not found');
  }
  return line;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  // Check for children before deleting
  const children = await lineQueries.findChildren(id);
  if (children.length > 0) {
    throw new AppError(400, 'HAS_CHILDREN', 'Cannot delete a line of business that has child lines. Remove children first.');
  }
  const success = await lineQueries.deactivate(id, updatedBy);
  if (!success) {
    throw new AppError(404, 'NOT_FOUND', 'Line of business not found');
  }
}
