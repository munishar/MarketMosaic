import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['status', 'effective_date', 'expiration_date', 'priority', 'created_at'];

export interface SubmissionFilters {
  status?: string;
  client_id?: string;
  priority?: string;
  created_by?: string;
}

export async function findAll(
  params: ListParams & SubmissionFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    status, client_id, priority, created_by,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['s.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(cl.company_name ILIKE $${paramIdx} OR s.notes ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (status) {
    conditions.push(`s.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }
  if (client_id) {
    conditions.push(`s.client_id = $${paramIdx}`);
    values.push(client_id);
    paramIdx++;
  }
  if (priority) {
    conditions.push(`s.priority = $${paramIdx}`);
    values.push(priority);
    paramIdx++;
  }
  if (created_by) {
    conditions.push(`s.created_by = $${paramIdx}`);
    values.push(created_by);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM submissions s
     LEFT JOIN clients cl ON s.client_id = cl.id
     ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT s.*,
            cl.company_name as client_name,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM submissions s
     LEFT JOIN clients cl ON s.client_id = cl.id
     LEFT JOIN users u ON s.created_by = u.id
     ${whereClause}
     ORDER BY s.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT s.*,
            cl.company_name as client_name,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM submissions s
     LEFT JOIN clients cl ON s.client_id = cl.id
     LEFT JOIN users u ON s.created_by = u.id
     WHERE s.id = $1 AND s.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByIdWithTargets(id: string): Promise<{
  submission: Record<string, unknown> | null;
  targets: Record<string, unknown>[];
}> {
  const submission = await findById(id);
  if (!submission) return { submission: null, targets: [] };

  const targetsResult = await query(
    `SELECT st.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            cr.name as carrier_name,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM submission_targets st
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     WHERE st.submission_id = $1
     ORDER BY st.created_at ASC`,
    [id],
  );

  return { submission, targets: targetsResult.rows as Record<string, unknown>[] };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO submissions (client_id, created_by, status, effective_date, expiration_date, lines_requested, notes, priority, renewal_of, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $2)
     RETURNING *`,
    [
      data.client_id,
      createdBy,
      'draft',
      data.effective_date,
      data.expiration_date,
      JSON.stringify(data.lines_requested ?? []),
      data.notes ?? null,
      data.priority ?? 'normal',
      data.renewal_of ?? null,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function update(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown> | null> {
  const allowedFields = [
    'client_id', 'status', 'effective_date', 'expiration_date',
    'lines_requested', 'submission_date', 'notes', 'priority', 'renewal_of',
  ];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      const dbValue = key === 'lines_requested' ? JSON.stringify(value) : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_by = $${paramIdx++}`, `updated_at = NOW()`);
  values.push(updatedBy, id);

  const result = await query(
    `UPDATE submissions SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE submissions SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}

export async function createTarget(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO submission_targets (submission_id, contact_id, carrier_id, line_of_business_id, status, response_due, notes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING *`,
    [
      data.submission_id,
      data.contact_id,
      data.carrier_id,
      data.line_of_business_id,
      'pending',
      data.response_due ?? null,
      data.notes ?? null,
      createdBy,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function findTargetsBySubmissionId(submissionId: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT st.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            cr.name as carrier_name,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM submission_targets st
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     WHERE st.submission_id = $1
     ORDER BY st.created_at ASC`,
    [submissionId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function markTargetsAsSent(submissionId: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    `UPDATE submission_targets SET status = 'submitted', sent_at = NOW(), updated_at = NOW()
     WHERE submission_id = $1 AND status = 'pending'
     RETURNING *`,
    [submissionId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function findUpcomingRenewals(daysWindows: number[]): Promise<Record<string, unknown>[]> {
  const maxDays = Math.max(...daysWindows);
  const result = await query(
    `SELECT s.*,
            cl.company_name as client_name,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM submissions s
     LEFT JOIN clients cl ON s.client_id = cl.id
     LEFT JOIN users u ON s.created_by = u.id
     WHERE s.is_active = true
       AND s.status IN ('bound', 'quoted')
       AND s.expiration_date IS NOT NULL
       AND s.expiration_date::date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $1 * INTERVAL '1 day')
     ORDER BY s.expiration_date ASC`,
    [maxDays],
  );
  return result.rows as Record<string, unknown>[];
}
