import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['name', 'form_number', 'type', 'edition_date', 'created_at'];

export async function findAll(params: ListParams & { carrier_id?: string; line_of_business_id?: string }): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'name', order = 'asc', search, carrier_id, line_of_business_id } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['fp.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(fp.name ILIKE $${paramIdx} OR fp.form_number ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  if (carrier_id) {
    conditions.push(`fp.carrier_id = $${paramIdx}`);
    values.push(carrier_id);
    paramIdx++;
  }

  if (line_of_business_id) {
    conditions.push(`fp.line_of_business_id = $${paramIdx}`);
    values.push(line_of_business_id);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM form_papers fp ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT fp.*, c.name as carrier_name, lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM form_papers fp
     LEFT JOIN carriers c ON fp.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON fp.line_of_business_id = lob.id
     ${whereClause}
     ORDER BY fp.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT fp.*, c.name as carrier_name, lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM form_papers fp
     LEFT JOIN carriers c ON fp.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON fp.line_of_business_id = lob.id
     WHERE fp.id = $1 AND fp.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO form_papers (name, form_number, carrier_id, line_of_business_id, edition_date, type, description, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING *`,
    [
      data.name,
      data.form_number ?? null,
      data.carrier_id,
      data.line_of_business_id,
      data.edition_date ?? null,
      data.type,
      data.description ?? null,
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
  const allowedFields = ['name', 'form_number', 'carrier_id', 'line_of_business_id', 'edition_date', 'type', 'description'];
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
    `UPDATE form_papers SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE form_papers SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}
