import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['company_name', 'status', 'industry', 'created_at'];

export interface ClientFilters {
  status?: string;
  assigned_servicer_id?: string;
  assigned_team_id?: string;
  tags?: string[];
  industry?: string;
  state?: string;
}

export async function findAll(
  params: ListParams & ClientFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'company_name', order = 'asc', search,
    status, assigned_servicer_id, assigned_team_id, tags, industry, state,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'company_name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['cl.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(cl.company_name ILIKE $${paramIdx} OR cl.dba ILIKE $${paramIdx} OR cl.primary_contact_email ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (status) {
    conditions.push(`cl.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }
  if (assigned_servicer_id) {
    conditions.push(`cl.assigned_servicer_id = $${paramIdx}`);
    values.push(assigned_servicer_id);
    paramIdx++;
  }
  if (assigned_team_id) {
    conditions.push(`cl.assigned_team_id = $${paramIdx}`);
    values.push(assigned_team_id);
    paramIdx++;
  }
  if (industry) {
    conditions.push(`cl.industry ILIKE $${paramIdx}`);
    values.push(`%${industry}%`);
    paramIdx++;
  }
  if (state) {
    conditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(cl.addresses::jsonb) addr WHERE addr->>'state' = $${paramIdx})`);
    values.push(state);
    paramIdx++;
  }
  if (tags && tags.length > 0) {
    conditions.push(`cl.tags && $${paramIdx}`);
    values.push(tags);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(`SELECT COUNT(*) as total FROM clients cl ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT cl.*,
            su.first_name as servicer_first_name, su.last_name as servicer_last_name,
            t.name as team_name
     FROM clients cl
     LEFT JOIN users su ON cl.assigned_servicer_id = su.id
     LEFT JOIN teams t ON cl.assigned_team_id = t.id
     ${whereClause}
     ORDER BY cl.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT cl.*,
            su.first_name as servicer_first_name, su.last_name as servicer_last_name,
            t.name as team_name
     FROM clients cl
     LEFT JOIN users su ON cl.assigned_servicer_id = su.id
     LEFT JOIN teams t ON cl.assigned_team_id = t.id
     WHERE cl.id = $1 AND cl.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO clients (company_name, dba, status, industry, naics_code, sic_code, revenue, employee_count, website, primary_contact_name, primary_contact_email, primary_contact_phone, addresses, assigned_servicer_id, assigned_team_id, notes, tags, created_by, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18)
     RETURNING *`,
    [
      data.company_name,
      data.dba ?? null,
      data.status ?? 'prospect',
      data.industry ?? null,
      data.naics_code ?? null,
      data.sic_code ?? null,
      data.revenue ?? null,
      data.employee_count ?? null,
      data.website ?? null,
      data.primary_contact_name ?? null,
      data.primary_contact_email ?? null,
      data.primary_contact_phone ?? null,
      JSON.stringify(data.addresses ?? []),
      data.assigned_servicer_id ?? null,
      data.assigned_team_id ?? null,
      data.notes ?? null,
      data.tags ?? [],
      createdBy,
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
    'company_name', 'dba', 'status', 'industry', 'naics_code', 'sic_code',
    'revenue', 'employee_count', 'website', 'primary_contact_name',
    'primary_contact_email', 'primary_contact_phone', 'addresses',
    'assigned_servicer_id', 'assigned_team_id', 'notes', 'tags',
  ];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      const dbValue = key === 'addresses' ? JSON.stringify(value) : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_by = $${paramIdx++}`, `updated_at = NOW()`);
  values.push(updatedBy, id);

  const result = await query(
    `UPDATE clients SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE clients SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}

export async function findSubmissions(clientId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as total FROM submissions WHERE client_id = $1 AND is_active = true',
    [clientId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT s.*, u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM submissions s
     LEFT JOIN users u ON s.created_by = u.id
     WHERE s.client_id = $1 AND s.is_active = true
     ORDER BY s.created_at DESC
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findActivities(clientId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM activities WHERE entity_type = 'client' AND entity_id = $1`,
    [clientId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT a.*, u.first_name as user_first_name, u.last_name as user_last_name
     FROM activities a
     LEFT JOIN users u ON a.user_id = u.id
     WHERE a.entity_type = 'client' AND a.entity_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findAttachments(clientId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM attachments WHERE entity_type = 'client' AND entity_id = $1`,
    [clientId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT a.*, u.first_name as uploaded_by_first_name, u.last_name as uploaded_by_last_name
     FROM attachments a
     LEFT JOIN users u ON a.uploaded_by = u.id
     WHERE a.entity_type = 'client' AND a.entity_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}
