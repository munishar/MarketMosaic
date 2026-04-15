import { query } from '@brokerflow/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

// ─── Sync Schedules ──────────────────────────────────

const SCHEDULE_SORT_FIELDS = ['schedule_type', 'frequency', 'next_run_at', 'last_run_at', 'created_at'];

export interface ScheduleFilters {
  schedule_type?: string;
  is_active?: boolean;
}

export async function findAllSchedules(
  params: ListParams & ScheduleFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    schedule_type,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = SCHEDULE_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['ss.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`ss.schedule_type ILIKE $${paramIdx}`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (schedule_type) {
    conditions.push(`ss.schedule_type = $${paramIdx}`);
    values.push(schedule_type);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM sync_schedules ss ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT ss.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM sync_schedules ss
     LEFT JOIN users u ON ss.created_by = u.id
     ${whereClause}
     ORDER BY ss.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findScheduleById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT ss.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM sync_schedules ss
     LEFT JOIN users u ON ss.created_by = u.id
     WHERE ss.id = $1 AND ss.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function createSchedule(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO sync_schedules (schedule_type, frequency, next_run_at, config, target_scope, follow_up_config, created_by)
     VALUES ($1, $2, NOW(), $3, $4, $5, $6)
     RETURNING *`,
    [
      data.schedule_type,
      data.frequency,
      JSON.stringify(data.config ?? {}),
      JSON.stringify(data.target_scope ?? {}),
      JSON.stringify(data.follow_up_config ?? {}),
      createdBy,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateSchedule(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown> | null> {
  const allowedFields = ['schedule_type', 'frequency', 'is_active', 'config', 'target_scope', 'follow_up_config'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      const dbValue = ['config', 'target_scope', 'follow_up_config'].includes(key)
        ? JSON.stringify(value)
        : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findScheduleById(id);

  setClauses.push(`updated_at = NOW()`);
  // updatedBy tracked via context (no updated_by column on sync_schedules per migration)
  void updatedBy;
  values.push(id);

  const result = await query(
    `UPDATE sync_schedules SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivateSchedule(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE sync_schedules SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING id',
    [id],
  );
  return result.rows.length > 0;
}

export async function findDueSchedules(): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT * FROM sync_schedules
     WHERE is_active = true AND next_run_at <= NOW()
     ORDER BY next_run_at ASC`,
    [],
  );
  return result.rows as Record<string, unknown>[];
}

export async function updateNextRun(id: string, nextRunAt: string): Promise<void> {
  await query(
    `UPDATE sync_schedules SET next_run_at = $1, last_run_at = NOW(), updated_at = NOW() WHERE id = $2`,
    [nextRunAt, id],
  );
}

// ─── Sync Jobs ───────────────────────────────────────

const JOB_SORT_FIELDS = ['job_type', 'status', 'started_at', 'completed_at', 'created_at'];

export interface JobFilters {
  schedule_id?: string;
  job_type?: string;
  status?: string;
}

export async function findAllJobs(
  params: ListParams & JobFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    schedule_id, job_type, status,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = JOB_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['1=1'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`sj.job_type ILIKE $${paramIdx}`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (schedule_id) {
    conditions.push(`sj.schedule_id = $${paramIdx}`);
    values.push(schedule_id);
    paramIdx++;
  }
  if (job_type) {
    conditions.push(`sj.job_type = $${paramIdx}`);
    values.push(job_type);
    paramIdx++;
  }
  if (status) {
    conditions.push(`sj.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM sync_jobs sj ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT sj.*,
            u.first_name as triggered_by_first_name, u.last_name as triggered_by_last_name
     FROM sync_jobs sj
     LEFT JOIN users u ON sj.triggered_by = u.id
     ${whereClause}
     ORDER BY sj.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findJobById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT sj.*,
            u.first_name as triggered_by_first_name, u.last_name as triggered_by_last_name
     FROM sync_jobs sj
     LEFT JOIN users u ON sj.triggered_by = u.id
     WHERE sj.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function createJob(data: Record<string, unknown>, triggeredBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO sync_jobs (schedule_id, job_type, status, triggered_by)
     VALUES ($1, $2, 'queued', $3)
     RETURNING *`,
    [
      data.schedule_id ?? null,
      data.job_type,
      triggeredBy,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateJobStatus(
  id: string,
  status: string,
  summary?: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const completedClause = ['complete', 'partial', 'failed', 'cancelled'].includes(status)
    ? ', completed_at = NOW()'
    : '';
  const startedClause = status === 'running' ? ', started_at = NOW()' : '';

  const result = await query(
    `UPDATE sync_jobs SET
       status = $1,
       records_processed = COALESCE($3, records_processed),
       records_updated = COALESCE($4, records_updated),
       records_failed = COALESCE($5, records_failed),
       error_log = COALESCE($6, error_log),
       summary = COALESCE($7, summary),
       updated_at = NOW()
       ${startedClause}${completedClause}
     WHERE id = $2
     RETURNING *`,
    [
      status,
      id,
      (summary?.records_processed as number | undefined) ?? null,
      (summary?.records_updated as number | undefined) ?? null,
      (summary?.records_failed as number | undefined) ?? null,
      summary?.error_log ? JSON.stringify(summary.error_log) : null,
      summary?.summary ? JSON.stringify(summary.summary) : null,
    ],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

// ─── AMS Connections ─────────────────────────────────

const CONNECTION_SORT_FIELDS = ['connection_name', 'provider', 'status', 'last_sync_at', 'created_at'];

export interface ConnectionFilters {
  provider?: string;
  status?: string;
}

export async function findAllConnections(
  params: ListParams & ConnectionFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'created_at', order = 'desc', search,
    provider, status,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = CONNECTION_SORT_FIELDS.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['ac.is_active = true'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`ac.connection_name ILIKE $${paramIdx}`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (provider) {
    conditions.push(`ac.provider = $${paramIdx}`);
    values.push(provider);
    paramIdx++;
  }
  if (status) {
    conditions.push(`ac.status = $${paramIdx}`);
    values.push(status);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM ams_connections ac ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT ac.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM ams_connections ac
     LEFT JOIN users u ON ac.created_by = u.id
     ${whereClause}
     ORDER BY ac.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findConnectionById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT ac.*,
            u.first_name as created_by_first_name, u.last_name as created_by_last_name
     FROM ams_connections ac
     LEFT JOIN users u ON ac.created_by = u.id
     WHERE ac.id = $1 AND ac.is_active = true`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function createConnection(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO ams_connections (provider, connection_name, api_endpoint, sync_direction, field_mapping, connection_config, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.provider,
      data.connection_name,
      data.api_endpoint ?? null,
      data.sync_direction,
      JSON.stringify(data.field_mappings ?? {}),
      JSON.stringify(data.connection_config ?? {}),
      createdBy,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateConnection(
  id: string,
  data: Record<string, unknown>,
  updatedBy: string,
): Promise<Record<string, unknown> | null> {
  const allowedFields = ['provider', 'connection_name', 'api_endpoint', 'sync_direction', 'field_mapping', 'connection_config', 'is_active', 'status'];
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      const dbValue = ['field_mapping', 'connection_config'].includes(key)
        ? JSON.stringify(value)
        : value;
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(dbValue);
      paramIdx++;
    }
    if (key === 'field_mappings') {
      setClauses.push(`field_mapping = $${paramIdx}`);
      values.push(JSON.stringify(value));
      paramIdx++;
    }
  }

  if (setClauses.length === 0) return findConnectionById(id);

  void updatedBy;
  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE ams_connections SET ${setClauses.join(', ')} WHERE id = $${paramIdx} AND is_active = true RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function updateConnectionStatus(id: string, status: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `UPDATE ams_connections SET status = $1, updated_at = NOW() WHERE id = $2 AND is_active = true RETURNING *`,
    [status, id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function deactivateConnection(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE ams_connections SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true RETURNING id',
    [id],
  );
  return result.rows.length > 0;
}

// ─── Reconciliation ──────────────────────────────────

export async function findBoundSubmissionTargets(): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT st.*,
            s.client_id, s.effective_date, s.expiration_date,
            cl.company_name as client_name,
            cr.name as carrier_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            lob.name as line_of_business_name
     FROM submission_targets st
     LEFT JOIN submissions s ON st.submission_id = s.id
     LEFT JOIN clients cl ON s.client_id = cl.id
     LEFT JOIN carriers cr ON st.carrier_id = cr.id
     LEFT JOIN contacts ct ON st.contact_id = ct.id
     LEFT JOIN lines_of_business lob ON st.line_of_business_id = lob.id
     WHERE st.status = 'bound' AND s.is_active = true
     ORDER BY st.updated_at DESC`,
    [],
  );
  return result.rows as Record<string, unknown>[];
}
