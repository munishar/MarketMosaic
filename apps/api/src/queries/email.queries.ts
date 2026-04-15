import { query } from '@marketmosaic/db';
import type { ListParams, PaginatedResult } from './carrier.queries';

const ALLOWED_SORT_FIELDS = ['sent_at', 'subject', 'from_address', 'direction', 'parse_status', 'created_at'];

export interface EmailFilters {
  direction?: string;
  parse_status?: string;
  client_id?: string;
  submission_id?: string;
  contact_id?: string;
  thread_id?: string;
  source?: string;
}

export async function findAll(
  params: ListParams & EmailFilters,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const {
    page = 1, limit = 25, sort = 'sent_at', order = 'desc', search,
    direction, parse_status, client_id, submission_id, contact_id, thread_id, source,
  } = params;
  const offset = (page - 1) * limit;
  const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'sent_at';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  const conditions: string[] = ['1=1'];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(e.subject ILIKE $${paramIdx} OR e.from_address ILIKE $${paramIdx} OR e.body_text ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }
  if (direction) {
    conditions.push(`e.direction = $${paramIdx}`);
    values.push(direction);
    paramIdx++;
  }
  if (parse_status) {
    conditions.push(`e.parse_status = $${paramIdx}`);
    values.push(parse_status);
    paramIdx++;
  }
  if (client_id) {
    conditions.push(`e.client_id = $${paramIdx}`);
    values.push(client_id);
    paramIdx++;
  }
  if (submission_id) {
    conditions.push(`e.submission_id = $${paramIdx}`);
    values.push(submission_id);
    paramIdx++;
  }
  if (contact_id) {
    conditions.push(`e.contact_id = $${paramIdx}`);
    values.push(contact_id);
    paramIdx++;
  }
  if (thread_id) {
    conditions.push(`e.thread_id = $${paramIdx}`);
    values.push(thread_id);
    paramIdx++;
  }
  if (source) {
    conditions.push(`e.source = $${paramIdx}`);
    values.push(source);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM emails e ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT e.*,
            cl.company_name as client_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            u.first_name as sent_by_first_name, u.last_name as sent_by_last_name
     FROM emails e
     LEFT JOIN clients cl ON e.client_id = cl.id
     LEFT JOIN contacts ct ON e.contact_id = ct.id
     LEFT JOIN users u ON e.sent_by_user_id = u.id
     ${whereClause}
     ORDER BY e.${sortField} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findById(id: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT e.*,
            cl.company_name as client_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            u.first_name as sent_by_first_name, u.last_name as sent_by_last_name
     FROM emails e
     LEFT JOIN clients cl ON e.client_id = cl.id
     LEFT JOIN contacts ct ON e.contact_id = ct.id
     LEFT JOIN users u ON e.sent_by_user_id = u.id
     WHERE e.id = $1`,
    [id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByThreadId(threadId: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT e.*,
            cl.company_name as client_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name,
            u.first_name as sent_by_first_name, u.last_name as sent_by_last_name
     FROM emails e
     LEFT JOIN clients cl ON e.client_id = cl.id
     LEFT JOIN contacts ct ON e.contact_id = ct.id
     LEFT JOIN users u ON e.sent_by_user_id = u.id
     WHERE e.thread_id = $1
     ORDER BY e.sent_at ASC`,
    [threadId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function findInbox(
  params: ListParams,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25, search } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['e.direction = \'inbound\''];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(e.subject ILIKE $${paramIdx} OR e.from_address ILIKE $${paramIdx})`);
    values.push(`%${search}%`);
    paramIdx++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM emails e ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const dataValues = [...values, limit, offset];
  const result = await query(
    `SELECT e.*,
            cl.company_name as client_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name
     FROM emails e
     LEFT JOIN clients cl ON e.client_id = cl.id
     LEFT JOIN contacts ct ON e.contact_id = ct.id
     ${whereClause}
     ORDER BY e.sent_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataValues,
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function findParseQueue(
  params: ListParams,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const { page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*) as total FROM emails e WHERE e.parse_status IN ('unparsed', 'review_needed')`,
    [],
  );
  const total = parseInt(countResult.rows[0].total as string, 10);

  const result = await query(
    `SELECT e.*,
            cl.company_name as client_name,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name
     FROM emails e
     LEFT JOIN clients cl ON e.client_id = cl.id
     LEFT JOIN contacts ct ON e.contact_id = ct.id
     WHERE e.parse_status IN ('unparsed', 'review_needed')
     ORDER BY e.sent_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return { rows: result.rows as Record<string, unknown>[], total };
}

export async function create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO emails (
       thread_id, direction, from_address, to_addresses, cc_addresses,
       subject, body_text, body_html, sent_at, client_id, submission_id,
       contact_id, attachments, parsed_data, parse_status, sent_by_user_id,
       source, import_job_id, external_message_id
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10, $11,
       $12, $13, $14, $15, $16,
       $17, $18, $19
     ) RETURNING *`,
    [
      data.thread_id ?? null,
      data.direction,
      data.from_address,
      data.to_addresses,
      data.cc_addresses ?? [],
      data.subject,
      data.body_text,
      data.body_html ?? null,
      data.sent_at ?? new Date().toISOString(),
      data.client_id ?? null,
      data.submission_id ?? null,
      data.contact_id ?? null,
      JSON.stringify(data.attachments ?? []),
      data.parsed_data ? JSON.stringify(data.parsed_data) : null,
      data.parse_status ?? 'unparsed',
      data.sent_by_user_id ?? null,
      data.source ?? 'platform',
      data.import_job_id ?? null,
      data.external_message_id ?? null,
    ],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateParsedData(
  id: string,
  parsedData: Record<string, unknown>,
  parseStatus: string,
): Promise<Record<string, unknown> | null> {
  const result = await query(
    `UPDATE emails SET parsed_data = $1, parse_status = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [JSON.stringify(parsedData), parseStatus, id],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findContactByEmail(email: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM contacts WHERE email = $1 AND is_active = true LIMIT 1`,
    [email],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findSubmissionBySubjectOrThread(
  subject: string,
  threadId: string | null,
): Promise<Record<string, unknown> | null> {
  if (threadId) {
    const threadResult = await query(
      `SELECT DISTINCT e.submission_id FROM emails e WHERE e.thread_id = $1 AND e.submission_id IS NOT NULL LIMIT 1`,
      [threadId],
    );
    if (threadResult.rows.length > 0) {
      const submissionId = (threadResult.rows[0] as Record<string, unknown>).submission_id as string;
      const subResult = await query(
        `SELECT * FROM submissions WHERE id = $1 AND is_active = true`,
        [submissionId],
      );
      return (subResult.rows[0] as Record<string, unknown>) ?? null;
    }
  }

  // Try matching subject to submission notes or client name
  const cleanSubject = subject.replace(/^(Re:|Fwd:|FW:)\s*/gi, '').trim();
  const result = await query(
    `SELECT s.* FROM submissions s
     LEFT JOIN clients cl ON s.client_id = cl.id
     WHERE s.is_active = true
       AND (s.notes ILIKE $1 OR cl.company_name ILIKE $1)
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [`%${cleanSubject}%`],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function findByExternalMessageId(externalId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM emails WHERE external_message_id = $1 LIMIT 1`,
    [externalId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}
