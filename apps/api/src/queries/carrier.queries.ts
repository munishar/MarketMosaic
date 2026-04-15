import { query } from '@marketmosaic/db';

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
}

const ALLOWED_SORT_FIELDS = ['name', 'type', 'am_best_rating', 'headquarters_state', 'created_at'];

export async function findAll(params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'name', order = 'asc', search } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['c.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(c.name ILIKE $${paramIdx} OR c.headquarters_state ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) as total FROM carriers c ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const rows = await query(
    `SELECT c.* FROM carriers c ${whereClause} ORDER BY c.${sortField} ${sortOrder} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: rows.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query('SELECT * FROM carriers WHERE id = $1 AND is_active = true', [id]);
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO carriers (name, am_best_rating, type, website, headquarters_state, appointed, appointment_date, notes, primary_contact_id, available_states, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
     RETURNING *`,
    [
      data.name,
      data.am_best_rating ?? null,
      data.type,
      data.website ?? null,
      data.headquarters_state ?? null,
      data.appointed ?? false,
      data.appointment_date ?? null,
      data.notes ?? null,
      data.primary_contact_id ?? null,
      data.available_states ?? [],
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
    'name', 'am_best_rating', 'type', 'website', 'headquarters_state',
    'appointed', 'appointment_date', 'notes', 'primary_contact_id', 'available_states',
  ];
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
    `UPDATE carriers SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE carriers SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}

export async function findContacts(carrierId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM contacts ct
     JOIN underwriter_capacity uc ON uc.contact_id = ct.id
     WHERE uc.carrier_id = $1 AND ct.is_active = true`,
    [carrierId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT DISTINCT ct.* FROM contacts ct
     JOIN underwriter_capacity uc ON uc.contact_id = ct.id
     WHERE uc.carrier_id = $1 AND ct.is_active = true
     ORDER BY ct.last_name, ct.first_name
     LIMIT $2 OFFSET $3`,
    [carrierId, limit, offset],
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findForms(carrierId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM form_papers fp WHERE fp.carrier_id = $1 AND fp.is_active = true`,
    [carrierId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT fp.*, lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM form_papers fp
     LEFT JOIN lines_of_business lob ON fp.line_of_business_id = lob.id
     WHERE fp.carrier_id = $1 AND fp.is_active = true
     ORDER BY fp.name
     LIMIT $2 OFFSET $3`,
    [carrierId, limit, offset],
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findLines(carrierId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(DISTINCT lob.id) as total FROM lines_of_business lob
     JOIN underwriter_capacity uc ON uc.line_of_business_id = lob.id
     WHERE uc.carrier_id = $1 AND lob.is_active = true`,
    [carrierId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT DISTINCT lob.* FROM lines_of_business lob
     JOIN underwriter_capacity uc ON uc.line_of_business_id = lob.id
     WHERE uc.carrier_id = $1 AND lob.is_active = true
     ORDER BY lob.name
     LIMIT $2 OFFSET $3`,
    [carrierId, limit, offset],
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}
