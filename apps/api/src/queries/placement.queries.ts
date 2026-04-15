import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

export interface PlacementFilters {
  status?: string;
  carrier_id?: string;
  submission_id?: string;
}

export async function findTargetById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT st.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            cr.name as carrier_name,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation,
            s.client_id, s.status as submission_status,
            cl.company_name as client_name
     FROM submission_targets st
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     LEFT JOIN submissions s ON st.submission_id = s.id
     LEFT JOIN clients cl ON s.client_id = cl.id
     WHERE st.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function updateTargetStatus(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown> | null> {
  const allowedFields = [
    'status', 'quoted_premium', 'quoted_limit', 'quoted_deductible',
    'quoted_terms', 'decline_reason', 'notes',
  ];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      const dbValue = key === 'quoted_terms' ? JSON.stringify(value) : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findTargetById(id);

  setClauses.push(`updated_by = $${paramIdx++}`, `updated_at = NOW()`);
  values.push(updatedBy, id);

  const result = await query(
    `UPDATE submission_targets SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findKanban(): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT st.id, st.submission_id, st.status, st.quoted_premium, st.created_at, st.updated_at,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            cr.name as carrier_name,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation,
            cl.company_name as client_name,
            s.client_id,
            EXTRACT(DAY FROM (NOW() - st.updated_at))::int as days_in_status
     FROM submission_targets st
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     LEFT JOIN submissions s ON st.submission_id = s.id
     LEFT JOIN clients cl ON s.client_id = cl.id
     WHERE s.is_active = true
     ORDER BY st.updated_at DESC`,
    [],
  );
  return result.rows as Record<string, unknown>[];
}

export async function findTimeline(params: ListParams & PlacementFilters): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, status, carrier_id, submission_id } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['s.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`st.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }
  if (carrier_id) {
    conditions.push(`st.carrier_id = $${paramIdx}`);
    values.push(carrier_id);
    paramIdx++;
  }
  if (submission_id) {
    conditions.push(`st.submission_id = $${paramIdx}`);
    values.push(submission_id);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM submission_targets st
     LEFT JOIN submissions s ON st.submission_id = s.id
     ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT st.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            cr.name as carrier_name,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation,
            cl.company_name as client_name,
            s.client_id, s.effective_date, s.expiration_date
     FROM submission_targets st
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     LEFT JOIN submissions s ON st.submission_id = s.id
     LEFT JOIN clients cl ON s.client_id = cl.id
     ${whereClause}
     ORDER BY st.updated_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function createNotification(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, action_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.user_id,
      data.type,
      data.title,
      data.message,
      data.action_url ?? null,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}
