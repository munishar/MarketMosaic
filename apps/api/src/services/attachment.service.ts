import * as attachmentQueries from '../queries/attachment.queries';
import { AppError } from '../middleware/error-handler';
import { storage } from '../lib/storage';
import type { ListParams } from '../queries/carrier.queries';
import type { AttachmentFilters } from '../queries/attachment.queries';

export interface AttachmentListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(
  params: ListParams & AttachmentFilters,
): Promise<AttachmentListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await attachmentQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const attachment = await attachmentQueries.findById(id);
  if (!attachment) throw new AppError(404, 'NOT_FOUND', 'Attachment not found');
  return attachment;
}

export async function getByClientId(
  clientId: string,
  params: ListParams,
): Promise<AttachmentListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await attachmentQueries.findByClientId(clientId, { ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export interface UploadInput {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

/**
 * Upload a file to cloud storage and persist metadata to the database.
 * `meta` may contain: type, client_id, submission_id, email_id, description, tags.
 */
export async function upload(
  file: UploadInput,
  meta: Record<string, unknown>,
  uploadedBy: string,
): Promise<Record<string, unknown>> {
  const timestamp = Date.now();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `attachments/${timestamp}_${safeName}`;

  const { url } = await storage.upload(key, file.buffer, file.mimetype);

  const attachment = await attachmentQueries.create(
    {
      filename: file.originalname,
      file_url: url,
      storage_key: key,
      file_size: file.size,
      mime_type: file.mimetype,
      type: meta.type ?? 'other',
      client_id: meta.client_id ?? null,
      submission_id: meta.submission_id ?? null,
      email_id: meta.email_id ?? null,
      description: meta.description ?? null,
      tags: meta.tags ?? [],
    },
    uploadedBy,
  );

  return attachment;
}

/**
 * Delete an attachment record from the database.
 * The backing file is removed from storage as well (best-effort).
 */
export async function remove(id: string): Promise<void> {
  const attachment = await getById(id); // throws 404 if missing

  // Best-effort storage delete using the stored key (preferred) or URL pathname fallback
  try {
    const storageKey = attachment.storage_key as string | null;
    if (storageKey) {
      await storage.delete(storageKey);
    }
  } catch {
    // Non-critical: log but don't fail the request
  }

  const deleted = await attachmentQueries.remove(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Attachment not found');
}
