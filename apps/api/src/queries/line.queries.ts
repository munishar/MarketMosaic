import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['name', 'abbreviation', 'category', 'created_at'];

export async function findAll(params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'name', order = 'asc', search } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['lob.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(lob.name ILIKE $${paramIdx} OR lob.abbreviation ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) as total FROM lines_of_business lob ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT lob.*, p.name as parent_line_name
     FROM lines_of_business lob
     LEFT JOIN lines_of_business p ON lob.parent_line_id = p.id
     ${whereClause}
     ORDER BY lob.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT lob.*, p.name as parent_line_name
     FROM lines_of_business lob
     LEFT JOIN lines_of_business p ON lob.parent_line_id = p.id
     WHERE lob.id = $1 AND lob.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findChildren(parentId: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    'SELECT * FROM lines_of_business WHERE parent_line_id = $1 AND is_active = true ORDER BY name',
    [parentId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO lines_of_business (name, abbreviation, category, description, parent_line_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     RETURNING *`,
    [
      data.name,
      data.abbreviation,
      data.category,
      data.description ?? null,
      data.parent_line_id ?? null,
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
  const allowedFields = ['name', 'abbreviation', 'category', 'description', 'parent_line_id'];
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

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push(`updated_by = $${paramIdx}`);
  values.push(updatedBy);
  paramIdx++;

  setClauses.push(`updated_at = NOW()`);

  values.push(id);
  const result = await query(
    `UPDATE lines_of_business SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE lines_of_business SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}
