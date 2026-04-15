import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['name', 'region', 'created_at'];

export async function findAll(
  params: ListParams & { region?: string },
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'name', order = 'asc', search, region } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(t.name ILIKE $${paramIdx} OR t.description ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (region) {
    conditions.push(`t.region = $${paramIdx}`);
    values.push(region);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) as total FROM teams t ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT t.*, u.first_name as manager_first_name, u.last_name as manager_last_name
     FROM teams t
     LEFT JOIN users u ON t.manager_id = u.id
     ${whereClause}
     ORDER BY t.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT t.*, u.first_name as manager_first_name, u.last_name as manager_last_name
     FROM teams t
     LEFT JOIN users u ON t.manager_id = u.id
     WHERE t.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findMembers(teamId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as total FROM users WHERE team_id = $1 AND is_active = true',
    [teamId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT id, email, first_name, last_name, role, region, specialties, phone, avatar_url, created_at
     FROM users WHERE team_id = $1 AND is_active = true
     ORDER BY last_name, first_name
     LIMIT $2 OFFSET $3`,
    [teamId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO teams (name, region, manager_id, description, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $5)
     RETURNING *`,
    [data.name, data.region ?? null, data.manager_id ?? null, data.description ?? null, createdBy],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function update(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown> | null> {
  const allowedFields = ['name', 'region', 'manager_id', 'description'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(value);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_by = $${paramIdx++}`, `updated_at = NOW()`);
  values.push(updatedBy, id);

  const result = await query(
    `UPDATE teams SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await query('DELETE FROM teams WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}
