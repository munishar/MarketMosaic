import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const MANIFEST_SORT_FIELDS = ['manifest_type', 'key', 'version', 'effective_from', 'created_at'];

export interface ManifestFilters {
  manifest_type?: string;
  key?: string;
  is_active?: boolean;
}

export async function findAll(
  params: ListParams & ManifestFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    manifest_type, key,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = MANIFEST_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['pm.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(pm.key ILIKE $${paramIdx} OR pm.change_notes ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (manifest_type) {
    conditions.push(`pm.manifest_type = $${paramIdx}`);
    values.push(manifest_type);
    paramIdx++;
  }
  if (key) {
    conditions.push(`pm.key = $${paramIdx}`);
    values.push(key);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM platform_manifests pm ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT pm.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM platform_manifests pm
     LEFT JOIN users u ON pm.created_by = u.id
     ${whereClause}
     ORDER BY pm.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT pm.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM platform_manifests pm
     LEFT JOIN users u ON pm.created_by = u.id
     WHERE pm.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findLatestByKey(key: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM platform_manifests WHERE key = $1 AND is_active = true ORDER BY version DESC LIMIT 1`,
    [key],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByKeyAndVersion(key: string, version: number): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM platform_manifests WHERE key = $1 AND version = $2`,
    [key, version],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function getMaxVersion(key: string): Promise<number> {
  const result = await query(
    'SELECT COALESCE(MAX(version), 0) as max_version FROM platform_manifests WHERE key = $1',
    [key],
  );
  return parseInt(result.rows[0].max_version as string, 10);
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const maxVersion = await getMaxVersion(data.key as string);
  const newVersion = maxVersion + 1;

  const result = await query(
    `INSERT INTO platform_manifests (manifest_type, key, version, config, effective_from, effective_to, created_by, change_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.manifest_type,
      data.key,
      newVersion,
      JSON.stringify(data.config),
      data.effective_from,
      data.effective_to ?? null,
      createdBy,
      data.change_notes ?? null,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function update(
  id: string,
  data: Record<string, unknown>,
  createdBy: string,
): Promise<Record<string, unknown> | null> {
  const existing = await findById(id);
  if (!existing) return null;

  // Deactivate the current version
  await query(
    `UPDATE platform_manifests SET is_active = false, effective_to = NOW(), updated_at = NOW() WHERE id = $1`,
    [id],
  );

  // Create new version with incremented version number
  const maxVersion = await getMaxVersion(existing.key as string);
  const newVersion = maxVersion + 1;

  const result = await query(
    `INSERT INTO platform_manifests (manifest_type, key, version, config, effective_from, effective_to, created_by, change_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      existing.manifest_type,
      existing.key,
      newVersion,
      JSON.stringify(data.config ?? existing.config),
      data.effective_from ?? new Date().toISOString(),
      data.effective_to ?? null,
      createdBy,
      data.change_notes ?? null,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function deactivate(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE platform_manifests SET is_active = false, effective_to = NOW(), updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING id',
    [id],
  );
  return result.rows.length > 0;
}

export async function rollback(key: string, targetVersion: number): Promise<Record<string, unknown> | null> {
  // Deactivate current active version
  await query(
    `UPDATE platform_manifests SET is_active = false, effective_to = NOW(), updated_at = NOW()
     WHERE key = $1 AND is_active = true`,
    [key],
  );

  // Activate the target version
  const result = await query(
    `UPDATE platform_manifests SET is_active = true, effective_to = NULL, updated_at = NOW()
     WHERE key = $1 AND version = $2
     RETURNING *`,
    [key, targetVersion],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}
