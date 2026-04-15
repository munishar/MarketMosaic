import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['first_name', 'last_name', 'email', 'contact_type', 'created_at'];

export interface ContactFilters {
  contact_type?: string;
  carrier_id?: string;
  line_of_business?: string;
  region?: string;
  is_active?: boolean;
}

export async function findAll(
  params: ListParams & ContactFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'last_name', order = 'asc', search,
    contact_type, carrier_id, line_of_business, region, is_active,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'last_name';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  // Default to active only unless explicitly set
  if (is_active !== false) {
    conditions.push('ct.is_active = true');
  }

  if (search) {
    conditions.push(`(ct.first_name ILIKE $${paramIdx} OR ct.last_name ILIKE $${paramIdx} OR ct.email ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (contact_type) {
    conditions.push(`ct.contact_type = $${paramIdx}`);
    values.push(contact_type);
    paramIdx++;
  }
  if (carrier_id) {
    conditions.push(`ct.carrier_id = $${paramIdx}`);
    values.push(carrier_id);
    paramIdx++;
  }
  if (line_of_business) {
    conditions.push(`$${paramIdx} = ANY(ct.lines_of_business)`);
    values.push(line_of_business);
    paramIdx++;
  }
  if (region) {
    conditions.push(`ct.region = $${paramIdx}`);
    values.push(region);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) as total FROM contacts ct ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT ct.*, c.name as carrier_name, c.type as carrier_type
     FROM contacts ct
     LEFT JOIN carriers c ON ct.carrier_id = c.id
     ${whereClause}
     ORDER BY ct.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT ct.*, c.name as carrier_name, c.type as carrier_type
     FROM contacts ct
     LEFT JOIN carriers c ON ct.carrier_id = c.id
     WHERE ct.id = $1 AND ct.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO contacts (first_name, last_name, email, phone, mobile, contact_type, title, carrier_id, region, lines_of_business, notes, tags, preferred_contact_method, created_by, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14)
     RETURNING *`,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.phone ?? null,
      data.mobile ?? null,
      data.contact_type,
      data.title ?? null,
      data.carrier_id ?? null,
      data.region ?? null,
      data.lines_of_business ?? [],
      data.notes ?? null,
      data.tags ?? [],
      data.preferred_contact_method ?? 'email',
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
    'first_name', 'last_name', 'email', 'phone', 'mobile', 'contact_type',
    'title', 'carrier_id', 'region', 'lines_of_business', 'notes', 'tags', 'preferred_contact_method',
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

  if (setClauses.length === 0) return findById(id);

  setClauses.push(`updated_by = $${paramIdx++}`, `updated_at = NOW()`);
  values.push(updatedBy, id);

  const result = await query(
    `UPDATE contacts SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE contacts SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}

export async function findCapacity(contactId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as total FROM underwriter_capacity WHERE contact_id = $1 AND is_active = true',
    [contactId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT uc.*,
            c.name as carrier_name, c.type as carrier_type,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation
     FROM underwriter_capacity uc
     LEFT JOIN carriers c ON uc.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     WHERE uc.contact_id = $1 AND uc.is_active = true
     ORDER BY c.name, lob.name
     LIMIT $2 OFFSET $3`,
    [contactId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findNetwork(contactId: string, params: ListParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    'SELECT COUNT(*) as total FROM network_relationships WHERE contact_id = $1',
    [contactId],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT nr.*,
            u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email, u.role as user_role
     FROM network_relationships nr
     LEFT JOIN users u ON nr.user_id = u.id
     WHERE nr.contact_id = $1
     ORDER BY nr.strength, u.last_name
     LIMIT $2 OFFSET $3`,
    [contactId, limit, offset],
  );
  return { rows: result.rows as Record<string, unknown>[], total };
}
