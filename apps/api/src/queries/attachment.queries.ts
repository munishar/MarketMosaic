import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['filename', 'type', 'created_at', 'file_size'];

export interface AttachmentFilters {
  client_id?: string;
  submission_id?: string;
  email_id?: string;
  type?: string;
  uploaded_by?: string;
}

export async function findAll(
  params: ListParams & AttachmentFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    client_id, submission_id, email_id, type, uploaded_by,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(a.filename ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (client_id) {
    conditions.push(`a.client_id = $${paramIdx}`);
    values.push(client_id);
    paramIdx++;
  }
  if (submission_id) {
    conditions.push(`a.submission_id = $${paramIdx}`);
    values.push(submission_id);
    paramIdx++;
  }
  if (email_id) {
    conditions.push(`a.email_id = $${paramIdx}`);
    values.push(email_id);
    paramIdx++;
  }
  if (type) {
    conditions.push(`a.type = $${paramIdx}`);
    values.push(type);
    paramIdx++;
  }
  if (uploaded_by) {
    conditions.push(`a.uploaded_by = $${paramIdx}`);
    values.push(uploaded_by);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) as total FROM attachments a ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  values.push(limit, offset);
  const dataResult = await query(
    `SELECT a.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     ${whereClause}
     ORDER BY a.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    values,
  );

  return { rows: dataResult.rows, total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT a.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findByClientId(
  clientId: string,
  params: ListParams,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'created_at', order = 'desc' } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const countResult = await query(
    'SELECT COUNT(*) as total FROM attachments a WHERE a.client_id = $1',
    [clientId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataResult = await query(
    `SELECT a.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.client_id = $1
     ORDER BY a.${sortField} ${sortOrder}
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );

  return { rows: dataResult.rows, total };
}

export async function create(
  data: Record<string, unknown>,
  uploadedBy: string,
): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO attachments (filename, file_url, storage_key, file_size, mime_type, type, client_id, submission_id, email_id, uploaded_by, description, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.filename,
      data.file_url,
      data.storage_key ?? null,
      data.file_size,
      data.mime_type,
      data.type ?? 'other',
      data.client_id ?? null,
      data.submission_id ?? null,
      data.email_id ?? null,
      uploadedBy,
      data.description ?? null,
      data.tags ?? [],
    ],
  );
  return result.rows[0];
}

export async function remove(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM attachments WHERE id = $1 RETURNING id',
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}
