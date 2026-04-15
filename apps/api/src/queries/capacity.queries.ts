import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

export interface CapacitySearchParams {
  line_id?: string;
  carrier_id?: string;
  min_limit?: string;
  state?: string;
  industry_class?: string;
  has_available_capacity?: boolean;
  page?: number;
  limit?: number;
}

const ALLOWED_SORT_FIELDS = ['created_at', 'max_limit', 'available_capacity'];

export async function findAll(params: ListParams & { carrier_id?: string; line_of_business_id?: string; contact_id?: string }): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, sort = 'created_at', order = 'desc', carrier_id, line_of_business_id, contact_id } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const conditions: string[] = ['uc.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (carrier_id) {
    conditions.push(`uc.carrier_id = $${paramIdx}`);
    values.push(carrier_id);
    paramIdx++;
  }

  if (line_of_business_id) {
    conditions.push(`uc.line_of_business_id = $${paramIdx}`);
    values.push(line_of_business_id);
    paramIdx++;
  }

  if (contact_id) {
    conditions.push(`uc.contact_id = $${paramIdx}`);
    values.push(contact_id);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM underwriter_capacity uc ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT uc.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            c.name as carrier_name, c.type as carrier_type, c.am_best_rating as carrier_rating,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation, lob.category as line_of_business_category,
            fp.name as form_paper_name
     FROM underwriter_capacity uc
     LEFT JOIN contacts ct ON uc.contact_id = ct.id
     LEFT JOIN carriers c ON uc.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     LEFT JOIN form_papers fp ON uc.form_paper_id = fp.id
     ${whereClause}
     ORDER BY uc.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT uc.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            c.name as carrier_name, c.type as carrier_type,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation,
            fp.name as form_paper_name
     FROM underwriter_capacity uc
     LEFT JOIN contacts ct ON uc.contact_id = ct.id
     LEFT JOIN carriers c ON uc.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     LEFT JOIN form_papers fp ON uc.form_paper_id = fp.id
     WHERE uc.id = $1 AND uc.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function search(params: CapacitySearchParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, line_id, carrier_id, min_limit, state, industry_class, has_available_capacity } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['uc.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (line_id) {
    conditions.push(`uc.line_of_business_id = $${paramIdx}`);
    values.push(line_id);
    paramIdx++;
  }

  if (carrier_id) {
    conditions.push(`uc.carrier_id = $${paramIdx}`);
    values.push(carrier_id);
    paramIdx++;
  }

  if (min_limit) {
    conditions.push(`uc.max_limit >= $${paramIdx}`);
    values.push(min_limit);
    paramIdx++;
  }

  if (state) {
    conditions.push(`$${paramIdx} = ANY(uc.appetite_states)`);
    values.push(state);
    paramIdx++;
  }

  if (industry_class) {
    conditions.push(`$${paramIdx} = ANY(uc.appetite_classes)`);
    values.push(industry_class);
    paramIdx++;
  }

  if (has_available_capacity) {
    conditions.push(`uc.available_capacity IS NOT NULL AND uc.available_capacity != '0' AND uc.available_capacity != ''`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM underwriter_capacity uc
     LEFT JOIN contacts ct ON uc.contact_id = ct.id
     LEFT JOIN carriers c ON uc.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT uc.*,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email, ct.phone as contact_phone,
            c.name as carrier_name, c.type as carrier_type, c.am_best_rating as carrier_rating, c.appointed as carrier_appointed,
            lob.name as line_of_business_name, lob.abbreviation as line_of_business_abbreviation, lob.category as line_of_business_category,
            fp.name as form_paper_name, fp.form_number as form_paper_number
     FROM underwriter_capacity uc
     LEFT JOIN contacts ct ON uc.contact_id = ct.id
     LEFT JOIN carriers c ON uc.carrier_id = c.id
     LEFT JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     LEFT JOIN form_papers fp ON uc.form_paper_id = fp.id
     ${whereClause}
     ORDER BY c.name, lob.name
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO underwriter_capacity (contact_id, carrier_id, line_of_business_id, form_paper_id, min_limit, max_limit, deployed_capacity, available_capacity, sir_range, deductible_range, appetite_classes, appetite_states, appetite_notes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
     RETURNING *`,
    [
      data.contact_id,
      data.carrier_id,
      data.line_of_business_id,
      data.form_paper_id ?? null,
      data.min_limit ?? null,
      data.max_limit ?? null,
      data.deployed_capacity ?? null,
      data.available_capacity ?? null,
      data.sir_range ?? null,
      data.deductible_range ?? null,
      data.appetite_classes ?? [],
      data.appetite_states ?? [],
      data.appetite_notes ?? null,
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
    'contact_id', 'carrier_id', 'line_of_business_id', 'form_paper_id',
    'min_limit', 'max_limit', 'deployed_capacity', 'available_capacity',
    'sir_range', 'deductible_range', 'appetite_classes', 'appetite_states', 'appetite_notes',
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
    `UPDATE underwriter_capacity SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivate(id: string, updatedBy: string): Promise<boolean> {
  const result = await query(
    'UPDATE underwriter_capacity SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING id',
    [updatedBy, id],
  );
  return result.rows.length > 0;
}
