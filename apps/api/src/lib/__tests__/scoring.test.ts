import { describe, it, expect } from 'vitest';
import { scoreCandidate, rankCandidates, type MatchCandidate, type MatchInput, type RelationshipData, type HistoricalData } from '../scoring';
import { RelationshipStrength } from '@brokerflow/shared';

const makeCandidate = (overrides: Partial<MatchCandidate> = {}): MatchCandidate => ({
  contact_id: 'ct1',
  carrier_id: 'car1',
  line_of_business_id: 'lob1',
  carrier_name: 'Hartford',
  contact_first_name: 'John',
  contact_last_name: 'Doe',
  contact_email: 'john@example.com',
  max_limit: '2000000',
  available_capacity: '1500000',
  appetite_classes: ['restaurant', 'retail'],
  appetite_states: ['CA', 'NY'],
  form_paper_name: 'Occurrence',
  line_of_business_name: 'General Liability',
  ...overrides,
});

const makeInput = (overrides: Partial<MatchInput> = {}): MatchInput => ({
  client_industry: 'restaurant',
  client_state: 'CA',
  requested_limit: 1000000,
  ...overrides,
});

describe('Scoring', () => {
  describe('scoreCandidate', () => {
    it('should give high score for perfect match', () => {
      const result = scoreCandidate(
        makeCandidate(),
        makeInput(),
        { contact_id: 'ct1', strength: RelationshipStrength.strong },
        { contact_id: 'ct1', total_submissions: 10, quoted_or_bound: 8, avg_response_days: 2 },
      );

      expect(result.overall_score).toBeGreaterThan(0.8);
      expect(result.factors.appetite_match).toBe(1.0);
      expect(result.factors.regional_alignment).toBe(1.0);
      expect(result.factors.relationship_strength).toBe(1.0);
    });

    it('should give lower score for weak match', () => {
      const result = scoreCandidate(
        makeCandidate({ appetite_classes: ['manufacturing'], appetite_states: ['TX'] }),
        makeInput(),
        undefined,
        undefined,
      );

      expect(result.overall_score).toBeLessThan(0.5);
    });

    it('should handle null client industry', () => {
      const result = scoreCandidate(
        makeCandidate(),
        makeInput({ client_industry: null }),
        undefined,
        undefined,
      );

      expect(result.factors.appetite_match).toBe(0.5);
    });

    it('should generate explanation', () => {
      const result = scoreCandidate(
        makeCandidate(),
        makeInput(),
        { contact_id: 'ct1', strength: RelationshipStrength.strong },
        { contact_id: 'ct1', total_submissions: 10, quoted_or_bound: 8, avg_response_days: 2 },
      );

      expect(result.explanation).toContain('Overall match score');
    });
  });

  describe('rankCandidates', () => {
    it('should sort candidates by overall score descending', () => {
      const candidates = [
        makeCandidate({ contact_id: 'ct1', appetite_classes: ['manufacturing'], appetite_states: ['TX'] }),
        makeCandidate({ contact_id: 'ct2', appetite_classes: ['restaurant'], appetite_states: ['CA'] }),
      ];
      
      const results = rankCandidates(candidates, makeInput(), [], []);
      expect(results[0].contact_id).toBe('ct2');
      expect(results[0].overall_score).toBeGreaterThan(results[1].overall_score);
    });

    it('should handle empty candidates', () => {
      const results = rankCandidates([], makeInput(), [], []);
      expect(results).toHaveLength(0);
    });
  });
});
