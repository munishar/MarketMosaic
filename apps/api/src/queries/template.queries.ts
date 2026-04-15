import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['name', 'type', 'category', 'created_at'];

export interface TemplateFilters {
  type?: string;
  category?: string;
  is_shared?: boolean;
  created_by?: string;
}

export async function findAll(
  params: ListParams & TemplateFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'name', order = 'asc', search,
    type, category, is_shared, created_by,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['t.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(t.name ILIKE $${paramIdx} OR t.category ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (type) {
    conditions.push(`t.type = $${paramIdx}`);
    values.push(type);
    paramIdx++;
  }
  if (category) {
    conditions.push(`t.category = $${paramIdx}`);
    values.push(category);
    paramIdx++;
  }
  if (is_shared !== undefined) {
    conditions.push(`t.is_shared = $${paramIdx}`);
    values.push(is_shared);
    paramIdx++;
  }
  if (created_by) {
    conditions.push(`t.created_by = $${paramIdx}`);
    values.push(created_by);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM templates t ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  values.push(limit, offset);
  const dataResult = await query(
    `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name
     FROM templates t
     LEFT JOIN users u ON t.created_by = u.id
     ${whereClause}
     ORDER BY t.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    values,
  );

  return { rows: dataResult.rows, total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT t.*, u.first_name as creator_first_name, u.last_name as creator_last_name
     FROM templates t
     LEFT JOIN users u ON t.created_by = u.id
     WHERE t.id = $1 AND t.is_active = true`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function create(
  data: Record<string, unknown>,
  createdBy: string,
): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO templates (name, type, content, merge_fields, created_by, is_shared, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.type,
      data.content,
      data.merge_fields ?? [],
      createdBy,
      data.is_shared ?? false,
      data.category ?? null,
    ],
  );
  return result.rows[0];
}

export async function update(
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const allowed = ['name', 'type', 'content', 'merge_fields', 'is_shared', 'category'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const field of allowed) {
    if (field in data) {
      setClauses.push(`${field} = $${paramIdx}`);
      values.push(data[field]);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE templates SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deactivate(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE templates SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING id',
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}
