import * as contactQueries from '../queries/contact.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { ContactFilters } from '../queries/contact.queries';

export interface ContactListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & ContactFilters): Promise<ContactListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await contactQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const contact = await contactQueries.findById(id);
  if (!contact) throw new AppError(404, 'NOT_FOUND', 'Contact not found');
  return contact;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const contact = await contactQueries.create(data, createdBy);
  await eventBus.emit('contact:created', { contact_id: contact.id as string, created_by: createdBy });
  return contact;
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const contact = await contactQueries.update(id, data, updatedBy);
  if (!contact) throw new AppError(404, 'NOT_FOUND', 'Contact not found');
  await eventBus.emit('contact:updated', { contact_id: contact.id as string, updated_by: updatedBy });
  return contact;
}

export async function remove(id: string, updatedBy: string): Promise<void> {
  const success = await contactQueries.deactivate(id, updatedBy);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Contact not found');
}

export async function getCapacity(contactId: string, params: ListParams): Promise<ContactListResult> {
  await getById(contactId); // verify contact exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await contactQueries.findCapacity(contactId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getNetwork(contactId: string, params: ListParams): Promise<ContactListResult> {
  await getById(contactId); // verify contact exists
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await contactQueries.findNetwork(contactId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}
