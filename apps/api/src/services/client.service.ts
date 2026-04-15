import * as clientQueries from '../queries/client.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { ClientFilters } from '../queries/client.queries';

export interface ClientListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & ClientFilters): Promise<ClientListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await clientQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const client = await clientQueries.findById(id);
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');
  return client;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const client = await clientQueries.create(data, createdBy);
  await eventBus.emit('client:created', { client_id: client.id as string, created_by: createdBy });
  return client;
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const client = await clientQueries.update(id, data, updatedBy);
  if (!client) throw new AppError(404, 'NOT_FOUND', 'Client not found');
  await eventBus.emit('client:updated', { client_id: client.id as string, updated_by: updatedBy });
  return client;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await clientQueries.deactivate(id, updatedBy);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Client not found');
}

export async function getSubmissions(clientId: string, params: ListParams): Promise<ClientListResult> {
  await getById(clientId); // verify client exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await clientQueries.findSubmissions(clientId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getActivities(clientId: string, params: ListParams): Promise<ClientListResult> {
  await getById(clientId); // verify client exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await clientQueries.findActivities(clientId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getAttachments(clientId: string, params: ListParams): Promise<ClientListResult> {
  await getById(clientId); // verify client exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await clientQueries.findAttachments(clientId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}
