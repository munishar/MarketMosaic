import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as networkService from '../network.service';

vi.mock('@brokerflow/db', () => ({
  query: vi.fn(),
}));

vi.mock('../../lib/event-bus', () => ({
  eventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

import { query } from '@brokerflow/db';
const mockQuery = vi.mocked(query);

describe('NetworkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGraph', () => {
    it('should return nodes and edges for network graph', async () => {
      // Users
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'u1', first_name: 'Alice', last_name: 'Admin', node_type: 'user' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // Contacts
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'ct1', first_name: 'John', last_name: 'UW', carrier_name: 'Hartford', node_type: 'contact' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });
      // Edges
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'nr1', user_id: 'u1', contact_id: 'ct1', strength: 'strong', deals_placed: 5 }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await networkService.getGraph('u1');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('searchContacts', () => {
    it('should return matching contacts', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'ct1', first_name: 'John', last_name: 'Doe', carrier_name: 'Hartford' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const results = await networkService.searchContacts('john');
      expect(results).toHaveLength(1);
    });
  });

  describe('findPath', () => {
    it('should find direct path between user and contact', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ user_id: 'u1', contact_id: 'ct1', strength: 'strong', hops: 1 }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await networkService.findPath('u1', 'ct1');
      expect(result.found).toBe(true);
      expect(result.paths).toHaveLength(1);
    });

    it('should indicate no path found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      const result = await networkService.findPath('u1', 'unknown');
      expect(result.found).toBe(false);
    });
  });

  describe('createRelationship', () => {
    it('should create a new relationship', async () => {
      // Check existing
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });
      // Create
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'nr1', user_id: 'u1', contact_id: 'ct1', strength: 'new_contact' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await networkService.createRelationship(
        { user_id: 'u1', contact_id: 'ct1' },
        'u1',
      );
      expect(result).toHaveProperty('id');
    });

    it('should throw conflict if relationship exists', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'existing' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      await expect(
        networkService.createRelationship({ user_id: 'u1', contact_id: 'ct1' }, 'u1'),
      ).rejects.toThrow('Relationship already exists');
    });
  });

  describe('updateRelationship', () => {
    it('should update relationship strength', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'nr1', strength: 'strong' }],
        command: '', rowCount: 1, oid: 0, fields: [],
      });

      const result = await networkService.updateRelationship('nr1', { strength: 'strong' }, 'u1');
      expect(result).toHaveProperty('strength');
    });

    it('should throw 404 for non-existent relationship', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] });

      await expect(
        networkService.updateRelationship('bad', { strength: 'strong' }, 'u1'),
      ).rejects.toThrow('Relationship not found');
    });
  });
});
