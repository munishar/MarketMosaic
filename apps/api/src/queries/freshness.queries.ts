import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const FRESHNESS_SORT_FIELDS = ['entity_type', 'freshness_status', 'freshness_score', 'last_verified_at', 'next_verification_due', 'created_at'];

export interface FreshnessFilters {
  entity_type?: string;
  freshness_status?: string;
  entity_id?: string;
}

export async function findAll(
  params: ListParams & FreshnessFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'freshness_score', order = 'asc', search,
    entity_type, freshness_status, entity_id,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = FRESHNESS_SORT_FIELDS.includes(sort) ? sort : 'freshness_score';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['1=1'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(dfs.entity_type ILIKE $${paramIdx} OR dfs.entity_id::text ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (entity_type) {
    conditions.push(`dfs.entity_type = $${paramIdx}`);
    values.push(entity_type);
    paramIdx++;
  }
  if (freshness_status) {
    conditions.push(`dfs.freshness_status = $${paramIdx}`);
    values.push(freshness_status);
    paramIdx++;
  }
  if (entity_id) {
    conditions.push(`dfs.entity_id = $${paramIdx}`);
    values.push(entity_id);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM data_freshness_scores dfs ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT dfs.*
     FROM data_freshness_scores dfs
     ${whereClause}
     ORDER BY dfs.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    'SELECT * FROM data_freshness_scores WHERE id = $1',
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByEntity(entityType: string, entityId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    'SELECT * FROM data_freshness_scores WHERE entity_type = $1 AND entity_id = $2',
    [entityType, entityId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function upsertScore(
  entityType: string,
  entityId: string,
  score: number,
  status: string,
  verifiedBy?: string,
  verificationSource?: string,
): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO data_freshness_scores (entity_type, entity_id, freshness_score, freshness_status, last_verified_at, last_verified_by, verification_source, next_verification_due)
     VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW() + INTERVAL '90 days')
     ON CONFLICT (entity_type, entity_id) DO UPDATE SET
       freshness_score = $3,
       freshness_status = $4,
       last_verified_at = NOW(),
       last_verified_by = COALESCE($5, data_freshness_scores.last_verified_by),
       verification_source = COALESCE($6, data_freshness_scores.verification_source),
       next_verification_due = NOW() + INTERVAL '90 days',
       updated_at = NOW()
     RETURNING *`,
    [entityType, entityId, score, status, verifiedBy ?? null, verificationSource ?? null],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateScore(
  id: string,
  score: number,
  status: string,
): Promise<Record<string, unknown> | null> {
  const result = await query(
    `UPDATE data_freshness_scores SET freshness_score = $1, freshness_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [score, status, id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findStaleRecords(threshold: number): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT * FROM data_freshness_scores WHERE freshness_score <= $1 ORDER BY freshness_score ASC`,
    [threshold],
  );
  return result.rows as Record<string, unknown>[];
}

export async function findAllForDecay(): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT * FROM data_freshness_scores WHERE freshness_status NOT IN ('refresh_pending', 'refresh_failed') ORDER BY freshness_score ASC`,
    [],
  );
  return result.rows as Record<string, unknown>[];
}

export async function markRefreshPending(entityType: string, entityId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `UPDATE data_freshness_scores SET freshness_status = 'refresh_pending', updated_at = NOW()
     WHERE entity_type = $1 AND entity_id = $2
     RETURNING *`,
    [entityType, entityId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}
