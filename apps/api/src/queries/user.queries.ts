import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['first_name', 'last_name', 'email', 'role', 'created_at'];

export async function findAll(
  params: ListParams & { role?: string; team_id?: string; region?: string },
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'last_name', order = 'asc', search, role, team_id, region } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'last_name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['u.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`,
    );
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (role) {
    conditions.push(`u.role = $${paramIdx}`);
    values.push(role);
    paramIdx++;
  }
  if (team_id) {
    conditions.push(`u.team_id = $${paramIdx}`);
    values.push(team_id);
    paramIdx++;
  }
  if (region) {
    conditions.push(`u.region = $${paramIdx}`);
    values.push(region);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, values);
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.region, u.team_id, u.specialties, u.phone, u.is_active, u.avatar_url, u.created_at, u.updated_at
     FROM users u ${whereClause}
     ORDER BY u.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT id, email, first_name, last_name, role, region, team_id, specialties, phone, is_active, avatar_url, created_at, updated_at
     FROM users WHERE id = $1 AND is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByEmail(email: string): Promise<Record<string, unknown> | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO users (email, first_name, last_name, role, region, team_id, specialties, phone, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
     RETURNING id, email, first_name, last_name, role, region, team_id, specialties, phone, is_active, avatar_url, created_at, updated_at`,
    [
      data.email,
      data.first_name,
      data.last_name,
      data.role,
      data.region ?? null,
      data.team_id ?? null,
      data.specialties ?? [],
      data.phone ?? null,
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
  const allowedFields = ['email', 'first_name', 'last_name', 'role', 'region', 'team_id', 'specialties', 'phone', 'avatar_url'];
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
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true
     RETURNING id, email, first_name, last_name, role, region, team_id, specialties, phone, is_active, avatar_url, created_at, updated_at`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE users SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}
