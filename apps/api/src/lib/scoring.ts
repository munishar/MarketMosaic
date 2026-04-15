import { RelationshipStrength } from '@marketmosaic/shared';

export interface MatchCandidate {
  contact_id: string;
  carrier_id: string;
  line_of_business_id: string;
  carrier_name: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  max_limit: string;
  available_capacity: string | null;
  appetite_classes: string[];
  appetite_states: string[];
  form_paper_name: string | null;
  line_of_business_name: string;
}

export interface MatchInput {
  client_industry: string | null;
  client_state: string | null;
  requested_limit: number;
}

export interface RelationshipData {
  contact_id: string;
  strength: RelationshipStrength;
}

export interface HistoricalData {
  contact_id: string;
  total_submissions: number;
  quoted_or_bound: number;
  avg_response_days: number;
}

export interface MatchScore {
  contact_id: string;
  carrier_id: string;
  carrier_name: string;
  contact_name: string;
  contact_email: string;
  line_of_business_name: string;
  overall_score: number;
  factors: {
    appetite_match: number;
    capacity_fit: number;
    relationship_strength: number;
    hit_ratio: number;
    regional_alignment: number;
    response_time: number;
  };
  explanation: string;
}

const WEIGHTS = {
  appetite_match: 0.25,
  capacity_fit: 0.20,
  relationship_strength: 0.20,
  hit_ratio: 0.15,
  regional_alignment: 0.10,
  response_time: 0.10,
};

export function scoreCandidate(
  candidate: MatchCandidate,
  input: MatchInput,
  relationship: RelationshipData | undefined,
  history: HistoricalData | undefined,
): MatchScore {
  // Appetite match (0-1): does appetite_classes include client's industry?
  const appetiteMatch = input.client_industry && candidate.appetite_classes.length > 0
    ? candidate.appetite_classes.some(c => c.toLowerCase() === input.client_industry!.toLowerCase()) ? 1.0 : 0.2
    : 0.5; // neutral if no data

  // Capacity fit (0-1): is available_capacity >= requested_limit?
  const availCap = candidate.available_capacity ? parseFloat(candidate.available_capacity) : 0;
  const maxLim = parseFloat(candidate.max_limit) || 0;
  const capacityFit = input.requested_limit <= 0 ? 0.5
    : availCap >= input.requested_limit ? 1.0
    : maxLim >= input.requested_limit ? 0.7
    : maxLim > 0 ? Math.min(maxLim / input.requested_limit, 0.5) : 0.1;

  // Relationship strength (0-1)
  const relScore = !relationship ? 0.1
    : relationship.strength === RelationshipStrength.strong ? 1.0
    : relationship.strength === RelationshipStrength.moderate ? 0.7
    : relationship.strength === RelationshipStrength.weak ? 0.4
    : 0.2;

  // Hit ratio (0-1)
  const hitRatio = !history || history.total_submissions === 0 ? 0.3
    : history.quoted_or_bound / history.total_submissions;

  // Regional alignment (0-1)
  const regionalAlignment = input.client_state && candidate.appetite_states.length > 0
    ? candidate.appetite_states.includes(input.client_state) ? 1.0 : 0.2
    : 0.5;

  // Response time (0-1): lower is better, cap at 30 days
  const responseTime = !history || history.avg_response_days <= 0 ? 0.5
    : history.avg_response_days <= 3 ? 1.0
    : history.avg_response_days <= 7 ? 0.8
    : history.avg_response_days <= 14 ? 0.5
    : history.avg_response_days <= 30 ? 0.3
    : 0.1;

  const factors = {
    appetite_match: appetiteMatch,
    capacity_fit: capacityFit,
    relationship_strength: relScore,
    hit_ratio: hitRatio,
    regional_alignment: regionalAlignment,
    response_time: responseTime,
  };

  const overall_score = Object.entries(WEIGHTS).reduce(
    (sum, [key, weight]) => sum + factors[key as keyof typeof factors] * weight,
    0,
  );

  const explanation = buildExplanation(candidate, factors, overall_score);

  return {
    contact_id: candidate.contact_id,
    carrier_id: candidate.carrier_id,
    carrier_name: candidate.carrier_name,
    contact_name: `${candidate.contact_first_name} ${candidate.contact_last_name}`,
    contact_email: candidate.contact_email,
    line_of_business_name: candidate.line_of_business_name,
    overall_score: Math.round(overall_score * 100) / 100,
    factors,
    explanation,
  };
}

function buildExplanation(candidate: MatchCandidate, factors: MatchScore['factors'], score: number): string {
  const parts: string[] = [];
  parts.push(`Overall match score: ${Math.round(score * 100)}%.`);
  if (factors.appetite_match >= 0.8) parts.push(`Strong appetite match for this industry.`);
  if (factors.capacity_fit >= 0.8) parts.push(`Capacity meets requested limit.`);
  if (factors.relationship_strength >= 0.7) parts.push(`Strong existing relationship.`);
  if (factors.hit_ratio >= 0.5) parts.push(`Good historical hit ratio.`);
  if (factors.regional_alignment >= 0.8) parts.push(`Aligned on region.`);
  if (factors.response_time >= 0.7) parts.push(`Fast response history.`);
  return parts.join(' ');
}

export function rankCandidates(
  candidates: MatchCandidate[],
  input: MatchInput,
  relationships: RelationshipData[],
  historicalData: HistoricalData[],
): MatchScore[] {
  const relMap = new Map(relationships.map(r => [r.contact_id, r]));
  const histMap = new Map(historicalData.map(h => [h.contact_id, h]));

  return candidates
    .map(c => scoreCandidate(c, input, relMap.get(c.contact_id), histMap.get(c.contact_id)))
    .sort((a, b) => b.overall_score - a.overall_score);
}
