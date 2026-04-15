import { query } from '@marketmosaic/db';

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
}

export async function getGraphData(userId: string, filters?: { carrier_id?: string; region?: string }): Promise<{
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
}> {
  // Get user nodes (team members)
  const userResult = await query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.region, 'user' as node_type
     FROM users u
     WHERE u.is_active = true
     ORDER BY u.last_name`,
    [],
  );

  // Get contact nodes
  const contactConditions = ['ct.is_active = true'];
  const contactValues: unknown[] = [];
  let idx = 1;

  if (filters?.carrier_id) {
    contactConditions.push(`ct.carrier_id = $${idx}`);
    contactValues.push(filters.carrier_id);
    idx++;
  }
  if (filters?.region) {
    contactConditions.push(`ct.region = $${idx}`);
    contactValues.push(filters.region);
    idx++;
  }

  const contactResult = await query(
    `SELECT ct.id, ct.first_name, ct.last_name, ct.email, ct.contact_type, ct.carrier_id, ct.region,
            c.name as carrier_name, 'contact' as node_type
     FROM contacts ct
     LEFT JOIN carriers c ON ct.carrier_id = c.id
     WHERE ${contactConditions.join(' AND ')}
     ORDER BY ct.last_name`,
    contactValues,
  );

  // Get edges (relationships)
  const edgeResult = await query(
    `SELECT nr.id, nr.user_id, nr.contact_id, nr.strength, nr.deals_placed, nr.last_interaction, nr.notes
     FROM network_relationships nr
     JOIN users u ON nr.user_id = u.id AND u.is_active = true
     JOIN contacts ct ON nr.contact_id = ct.id AND ct.is_active = true
     ORDER BY nr.strength`,
    [],
  );

  return {
    nodes: [...(userResult.rows as Record<string, unknown>[]), ...(contactResult.rows as Record<string, unknown>[])],
    edges: edgeResult.rows as Record<string, unknown>[],
  };
}

export async function searchPath(fromUserId: string, toContactId: string): Promise<Record<string, unknown>[]> {
  // BFS path finding through network relationships
  // Find direct connections first, then 2-hop paths
  const result = await query(
    `WITH direct AS (
       SELECT nr.user_id, nr.contact_id, nr.strength, 1 as hops,
              ARRAY[nr.user_id::text, nr.contact_id::text] as path
       FROM network_relationships nr
       WHERE nr.user_id = $1 AND nr.contact_id = $2
     ),
     two_hop AS (
       SELECT nr1.user_id as start_user, nr1.contact_id as via_contact,
              nr2.user_id as via_user, nr2.contact_id as end_contact,
              nr1.strength as first_strength, nr2.strength as second_strength,
              2 as hops
       FROM network_relationships nr1
       JOIN network_relationships nr2 ON nr2.contact_id = $2
       WHERE nr1.user_id = $1 AND nr1.contact_id != $2
       AND EXISTS (
         SELECT 1 FROM network_relationships nr3
         WHERE nr3.contact_id = nr1.contact_id AND nr3.user_id = nr2.user_id
       )
       LIMIT 5
     )
     SELECT * FROM direct
     UNION ALL
     SELECT start_user as user_id, end_contact as contact_id, first_strength as strength, hops, 
            ARRAY[start_user::text, via_contact::text, via_user::text, end_contact::text] as path
     FROM two_hop
     ORDER BY hops ASC
     LIMIT 10`,
    [fromUserId, toContactId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function findRelationship(userId: string, contactId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT * FROM network_relationships WHERE user_id = $1 AND contact_id = $2`,
    [userId, contactId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function createRelationship(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const result = await query(
    `INSERT INTO network_relationships (user_id, contact_id, strength, deals_placed, notes, introduced_by, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [data.user_id, data.contact_id, data.strength ?? 'new_contact', data.deals_placed ?? 0, data.notes ?? null, data.introduced_by ?? null, createdBy],
  );
  return result.rows[0] as Record<string, unknown>;
}

export async function updateRelationship(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown> | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  const allowed = ['strength', 'deals_placed', 'last_interaction', 'notes'];

  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key)) {
      setClauses.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }
  if (setClauses.length === 0) return null;

  setClauses.push(`updated_by = $${idx}`);
  values.push(updatedBy);
  idx++;
  setClauses.push(`updated_at = NOW()`);

  values.push(id);
  const result = await query(
    `UPDATE network_relationships SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function searchContacts(searchTerm: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT ct.id, ct.first_name, ct.last_name, ct.email, ct.carrier_id,
            c.name as carrier_name, ct.region
     FROM contacts ct
     LEFT JOIN carriers c ON ct.carrier_id = c.id
     WHERE ct.is_active = true
     AND (ct.first_name ILIKE $1 OR ct.last_name ILIKE $1 OR ct.email ILIKE $1 OR c.name ILIKE $1)
     ORDER BY ct.last_name
     LIMIT 20`,
    [`%${searchTerm}%`],
  );
  return result.rows as Record<string, unknown>[];
}
