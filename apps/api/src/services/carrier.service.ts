import * as carrierQueries from '../queries/carrier.queries';
import { AppError } from '../middleware/error-handler';
import type { ListParams } from '../queries/carrier.queries';

export interface CarrierListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams): Promise<CarrierListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await carrierQueries.findAll({ ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const carrier = await carrierQueries.findById(id);
  if (!carrier) {
    throw new AppError(404, 'NOT_FOUND', 'Carrier not found');
  }
  return carrier;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  return carrierQueries.create(data, createdBy);
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const carrier = await carrierQueries.update(id, data, updatedBy);
  if (!carrier) {
    throw new AppError(404, 'NOT_FOUND', 'Carrier not found');
  }
  return carrier;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await carrierQueries.deactivate(id, updatedBy);
  if (!success) {
    throw new AppError(404, 'NOT_FOUND', 'Carrier not found');
  }
}

export async function getContacts(carrierId: string, params: ListParams): Promise<CarrierListResult> {
  await getById(carrierId); // verify carrier exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await carrierQueries.findContacts(carrierId, { ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getForms(carrierId: string, params: ListParams): Promise<CarrierListResult> {
  await getById(carrierId); // verify carrier exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await carrierQueries.findForms(carrierId, { ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getLines(carrierId: string, params: ListParams): Promise<CarrierListResult> {
  await getById(carrierId); // verify carrier exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await carrierQueries.findLines(carrierId, { ...params, page, limit });
  return {
    data: rows,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
