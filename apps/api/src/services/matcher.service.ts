import * as matchQueries from '../queries/match.queries';
import { AppError } from '../middleware/error-handler';
import { scoreCandidate, rankCandidates, type MatchCandidate, type MatchInput, type RelationshipData, type HistoricalData, type MatchScore } from '../lib/scoring';
import { RelationshipStrength } from '@marketmosaic/shared';

export interface MatchRequest {
  client_id: string;
  line_of_business_id: string;
  requested_limit: number;
}

export interface MatchResult {
  match_id: string;
  client_id: string;
  line_of_business_id: string;
  requested_limit: number;
  matches: MatchScore[];
  timestamp: string;
}

// In-memory store for match results (for explain endpoint)
const matchStore = new Map<string, MatchResult>();

export async function matchUnderwriters(request: MatchRequest, userId: string, teamId: string | null): Promise<MatchResult> {
  // 1. Get client profile
  const client = await matchQueries.getClientProfile(request.client_id);
  if (!client) {
    throw new AppError(404, 'NOT_FOUND', 'Client not found');
  }

  // Extract client state from addresses
  const addresses = client.addresses as Array<{ state?: string }> | null;
  const clientState = addresses && addresses.length > 0 ? addresses[0]?.state ?? null : null;

  // 2. Get matching capacity records
  const capacityRows = await matchQueries.getMatchingCapacity({
    line_of_business_id: request.line_of_business_id,
    state: clientState ?? undefined,
    industry: (client.industry as string) ?? undefined,
  });

  // 3. Get team relationships
  const relationshipsRaw = await matchQueries.getTeamRelationships(teamId, userId);
  const relationships: RelationshipData[] = relationshipsRaw.map(r => ({
    contact_id: r.contact_id as string,
    strength: r.strength as RelationshipStrength,
  }));

  // 4. Get historical performance
  const contactIds = [...new Set(capacityRows.map(r => r.contact_id as string))];
  const historyRaw = await matchQueries.getHistoricalPerformance(contactIds);
  const historicalData: HistoricalData[] = historyRaw.map(h => ({
    contact_id: h.contact_id as string,
    total_submissions: h.total_submissions as number,
    quoted_or_bound: h.quoted_or_bound as number,
    avg_response_days: h.avg_response_days as number,
  }));

  // 5. Build input and score
  const matchInput: MatchInput = {
    client_industry: (client.industry as string) ?? null,
    client_state: clientState,
    requested_limit: request.requested_limit,
  };

  const candidates: MatchCandidate[] = capacityRows.map(r => ({
    contact_id: r.contact_id as string,
    carrier_id: r.carrier_id as string,
    line_of_business_id: r.line_of_business_id as string,
    carrier_name: r.carrier_name as string,
    contact_first_name: r.contact_first_name as string,
    contact_last_name: r.contact_last_name as string,
    contact_email: r.contact_email as string,
    max_limit: r.max_limit as string,
    available_capacity: (r.available_capacity as string) ?? null,
    appetite_classes: (r.appetite_classes as string[]) ?? [],
    appetite_states: (r.appetite_states as string[]) ?? [],
    form_paper_name: (r.form_paper_name as string) ?? null,
    line_of_business_name: r.line_of_business_name as string,
  }));

  const matches = rankCandidates(candidates, matchInput, relationships, historicalData);

  // Store result for explain endpoint
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const result: MatchResult = {
    match_id: matchId,
    client_id: request.client_id,
    line_of_business_id: request.line_of_business_id,
    requested_limit: request.requested_limit,
    matches,
    timestamp: new Date().toISOString(),
  };

  matchStore.set(matchId, result);

  // Clean up old results (keep last 100)
  if (matchStore.size > 100) {
    const keys = Array.from(matchStore.keys());
    for (let i = 0; i < keys.length - 100; i++) {
      matchStore.delete(keys[i]);
    }
  }

  return result;
}

export function getMatchExplanation(matchId: string): MatchResult {
  const result = matchStore.get(matchId);
  if (!result) {
    throw new AppError(404, 'NOT_FOUND', 'Match result not found or expired');
  }
  return result;
}
