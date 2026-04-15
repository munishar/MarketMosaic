import { query } from '@brokerflow/db';

export async function getClientProfile(clientId: string): Promise<Record<string, unknown> | null> {
  const result = await query(
    `SELECT id, company_name, industry, naics_code, addresses, assigned_servicer_id, assigned_team_id, tags
     FROM clients WHERE id = $1 AND is_active = true`,
    [clientId],
  );
  return (result.rows[0] as Record<string, unknown>) ?? null;
}

export async function getMatchingCapacity(params: {
  line_of_business_id: string;
  state?: string;
  industry?: string;
}): Promise<Record<string, unknown>[]> {
  const conditions = ['uc.is_active = true'];
  const values: unknown[] = [];
  let idx = 1;

  conditions.push(`uc.line_of_business_id = $${idx}`);
  values.push(params.line_of_business_id);
  idx++;

  const result = await query(
    `SELECT uc.contact_id, uc.carrier_id, uc.line_of_business_id,
            uc.max_limit, uc.available_capacity, uc.appetite_classes, uc.appetite_states,
            ct.first_name as contact_first_name, ct.last_name as contact_last_name, ct.email as contact_email,
            c.name as carrier_name,
            lob.name as line_of_business_name,
            fp.name as form_paper_name
     FROM underwriter_capacity uc
     JOIN contacts ct ON uc.contact_id = ct.id AND ct.is_active = true
     JOIN carriers c ON uc.carrier_id = c.id AND c.is_active = true
     JOIN lines_of_business lob ON uc.line_of_business_id = lob.id
     LEFT JOIN form_papers fp ON uc.form_paper_id = fp.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY c.name, ct.last_name`,
    values,
  );
  return result.rows as Record<string, unknown>[];
}

export async function getTeamRelationships(teamId: string | null, userId: string): Promise<Record<string, unknown>[]> {
  const result = await query(
    `SELECT nr.contact_id, nr.strength
     FROM network_relationships nr
     JOIN users u ON nr.user_id = u.id
     WHERE (u.id = $1 OR ($2 IS NOT NULL AND u.team_id = $2))
     ORDER BY CASE nr.strength WHEN 'strong' THEN 1 WHEN 'moderate' THEN 2 WHEN 'weak' THEN 3 ELSE 4 END`,
    [userId, teamId],
  );
  return result.rows as Record<string, unknown>[];
}

export async function getHistoricalPerformance(contactIds: string[]): Promise<Record<string, unknown>[]> {
  if (contactIds.length === 0) return [];
  const placeholders = contactIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query(
    `SELECT st.contact_id,
            COUNT(*)::int as total_submissions,
            COUNT(*) FILTER (WHERE st.status IN ('quoted', 'bound'))::int as quoted_or_bound,
            COALESCE(AVG(
              CASE WHEN st.sent_at IS NOT NULL AND st.updated_at > st.sent_at
              THEN EXTRACT(EPOCH FROM (st.updated_at - st.sent_at)) / 86400.0
              ELSE NULL END
            ), 0)::float as avg_response_days
     FROM submission_targets st
     WHERE st.contact_id IN (${placeholders})
     GROUP BY st.contact_id`,
    contactIds,
  );
  return result.rows as Record<string, unknown>[];
}
