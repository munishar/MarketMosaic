import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

export async function findAll(
  params: ListParams & { user_id?: string; status?: string },
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, user_id, status } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['1=1'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (user_id) {
    conditions.push(`j.user_id = $${paramIdx}`);
    values.push(user_id);
    paramIdx++;
  }
  if (status) {
    conditions.push(`j.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM email_import_jobs j ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT j.*,
            u.first_name as user_first_name, u.last_name as user_last_name
     FROM email_import_jobs j
     LEFT JOIN users u ON j.user_id = u.id
     ${whereClause}
     ORDER BY j.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT j.*,
            u.first_name as user_first_name, u.last_name as user_last_name
     FROM email_import_jobs j
     LEFT JOIN users u ON j.user_id = u.id
     WHERE j.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findActiveByUserId(userId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM email_import_jobs
     WHERE user_id = $1 AND status NOT IN ('complete', 'failed', 'cancelled')
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO email_import_jobs (
       user_id, provider, oauth_token_encrypted, date_range_start, date_range_end,
       status, excluded_contacts, incremental_sync_enabled
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.user_id,
      data.provider,
      data.oauth_token_encrypted ?? '',
      data.date_range_start,
      data.date_range_end,
      data.status ?? 'connecting',
      data.excluded_contacts ?? [],
      data.incremental_sync_enabled ?? false,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateStatus(
  id: string,
  status: string,
  updates: Record<string, unknown> = {},
): Promise<Record<string, unknown> | null> {
  const setClauses: string[] = ['status = $1', 'updated_at = NOW()'];
  const values: unknown[] = [status];
  let paramIdx = 2;

  const allowedFields = [
    'total_emails_scanned', 'matched_emails', 'imported_emails',
    'matched_contacts', 'enrichment_status', 'progress_percent',
    'error_message', 'completed_at', 'import_report', 'oauth_token_encrypted',
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      const dbValue = key === 'import_report' ? JSON.stringify(value) : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
  }

  values.push(id);
  const result = await query(
    `UPDATE email_import_jobs SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function cancel(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `UPDATE email_import_jobs SET status = 'cancelled', completed_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND status NOT IN ('complete', 'failed', 'cancelled')
     RETURNING *`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function purgeImportedEmails(jobId: string): Promise<number> {
  const result = await query(
    `DELETE FROM emails WHERE import_job_id = $1`,
    [jobId],
  );
  return result.rowCount ?? 0;
}

export async function getContactEmails(): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT id, email, first_name, last_name FROM contacts WHERE is_active = true AND email IS NOT NULL`,
    [],
  );
  return result.rows as Record<string, unknown>[];
}

export async function countImportedEmailsByJob(jobId: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as total FROM emails WHERE import_job_id = $1`,
    [jobId],
  );
  return parseInt(result.rows[0].total as string, 10);
}

export async function updateSettings(
  id: string,
  settings: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const setClauses: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIdx = 1;

  const allowedFields = [
    'excluded_contacts', 'incremental_sync_enabled', 'date_range_start', 'date_range_end',
  ];

  for (const [key, value] of Object.entries(settings)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(value);
      paramIdx++;
    }
  }

  if (setClauses.length === 1) return findById(id);

  values.push(id);
  const result = await query(
    `UPDATE email_import_jobs SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}
