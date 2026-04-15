import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as matcherService from '../matcher.service';

vi.mock('@marketmosaic/db', () => ({
  query: vi.fn(),
}));

import { query } from '@marketmosaic/db';
const mockQuery = vi.mocked(query);

describe('MatcherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('matchUnderwriters', () => {
    it('should return ranked matches for a valid request', async () => {
      // Mock client query
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'client1',
          company_name: 'Acme Corp',
          industry: 'restaurant',
          addresses: [{ state: 'CA' }],
          assigned_servicer_id: 'user1',
          assigned_team_id: 'team1',
        }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      // Mock capacity query
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            contact_id: 'ct1', carrier_id: 'car1', line_of_business_id: 'lob1',
            carrier_name: 'Hartford', contact_first_name: 'John', contact_last_name: 'Doe',
            contact_email: 'john@hartford.com', max_limit: '2000000', available_capacity: '1500000',
            appetite_classes: ['restaurant', 'retail'], appetite_states: ['CA', 'NY'],
            form_paper_name: 'Occurrence', line_of_business_name: 'General Liability',
          },
          {
            contact_id: 'ct2', carrier_id: 'car2', line_of_business_id: 'lob1',
            carrier_name: 'Chubb', contact_first_name: 'Jane', contact_last_name: 'Smith',
            contact_email: 'jane@chubb.com', max_limit: '5000000', available_capacity: '3000000',
            appetite_classes: ['manufacturing'], appetite_states: ['NY'],
            form_paper_name: null, line_of_business_name: 'General Liability',
          },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      // Mock relationships query
      mockQuery.mockResolvedValueOnce({
        rows: [{ contact_id: 'ct1', strength: 'strong' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      // Mock historical performance query
      mockQuery.mockResolvedValueOnce({
        rows: [
          { contact_id: 'ct1', total_submissions: 10, quoted_or_bound: 7, avg_response_days: 3 },
          { contact_id: 'ct2', total_submissions: 5, quoted_or_bound: 1, avg_response_days: 15 },
        ],
        command: '', rowCount: 2, oid: 0, fields: [],
      });

      const result = await matcherService.matchUnderwriters(
        { client_id: 'client1', line_of_business_id: 'lob1', requested_limit: 1000000 },
        'user1',
        'team1',
      );

      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].contact_id).toBe('ct1'); // Hartford should rank higher
      expect(result.matches[0].overall_score).toBeGreaterThan(result.matches[1].overall_score);
      expect(result.match_id).toBeDefined();
      expect(result.matches[0].factors).toHaveProperty('appetite_match');
      expect(result.matches[0].factors).toHaveProperty('capacity_fit');
      expect(result.matches[0].factors).toHaveProperty('relationship_strength');
      expect(result.matches[0].explanation).toBeTruthy();
    });

    it('should throw 404 when client not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(
        matcherService.matchUnderwriters(
          { client_id: 'bad', line_of_business_id: 'lob1', requested_limit: 1000000 },
          'user1', 'team1',
        )
      ).rejects.toThrow('Client not found');
    });

    it('should return empty matches when no capacity found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'c1', industry: 'tech', addresses: [], assigned_servicer_id: 'u1', assigned_team_id: 't1' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      const result = await matcherService.matchUnderwriters(
        { client_id: 'c1', line_of_business_id: 'lob1', requested_limit: 1000000 },
        'u1', 't1',
      );
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('getMatchExplanation', () => {
    it('should throw 404 for unknown match id', () => {
      expect(() => matcherService.getMatchExplanation('unknown')).toThrow('Match result not found');
    });
  });
});
