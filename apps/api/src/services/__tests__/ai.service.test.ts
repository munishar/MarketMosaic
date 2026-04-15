import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiService from '../ai.service';

// Mock the orchestrator module
vi.mock('../../ai/assistant/orchestrator', () => ({
  processMessage: vi.fn().mockResolvedValue({
    response: 'I found 3 clients matching your search.',
    actions: [],
    has_pending_confirmations: false,
  }),
}));

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear all chat histories
    aiService.clearHistory('user1');
    aiService.clearHistory('user2');
  });

  describe('chat', () => {
    it('should process a message and return response', async () => {
      const result = await aiService.chat({
        message: 'Find clients in California',
        user: { user_id: 'user1', first_name: 'Test', last_name: 'User', role: 'admin', region: 'West' },
      });

      expect(result.response).toBe('I found 3 clients matching your search.');
      expect(result.history).toHaveLength(2); // user msg + assistant msg
    });

    it('should maintain history across messages', async () => {
      await aiService.chat({
        message: 'First message',
        user: { user_id: 'user1', role: 'admin' },
      });

      const result = await aiService.chat({
        message: 'Second message',
        user: { user_id: 'user1', role: 'admin' },
      });

      expect(result.history).toHaveLength(4); // 2 user + 2 assistant
    });

    it('should keep separate history per user', async () => {
      await aiService.chat({
        message: 'User1 message',
        user: { user_id: 'user1', role: 'admin' },
      });

      await aiService.chat({
        message: 'User2 message',
        user: { user_id: 'user2', role: 'servicer' },
      });

      const history1 = aiService.getHistory('user1');
      const history2 = aiService.getHistory('user2');
      expect(history1).toHaveLength(2);
      expect(history2).toHaveLength(2);
    });
  });

  describe('getHistory', () => {
    it('should return empty array for new user', () => {
      const history = aiService.getHistory('unknown');
      expect(history).toEqual([]);
    });
  });

  describe('clearHistory', () => {
    it('should clear user chat history', async () => {
      await aiService.chat({
        message: 'Test',
        user: { user_id: 'user1', role: 'admin' },
      });

      aiService.clearHistory('user1');
      expect(aiService.getHistory('user1')).toEqual([]);
    });
  });

  describe('executeAction', () => {
    it('should execute a read action', async () => {
      const result = await aiService.executeAction({
        tool_name: 'search_clients',
        parameters: { search: 'test' },
        user: { user_id: 'user1', role: 'admin' },
      });

      expect(result.success).toBe(true);
    });

    it('should reject write actions for viewers', async () => {
      await expect(
        aiService.executeAction({
          tool_name: 'create_submission',
          parameters: {},
          user: { user_id: 'viewer1', role: 'viewer' },
        }),
      ).rejects.toThrow('Viewers cannot execute write actions');
    });

    it('should allow write actions for non-viewers', async () => {
      const result = await aiService.executeAction({
        tool_name: 'create_submission',
        parameters: { client_id: 'c1' },
        user: { user_id: 'user1', role: 'servicer' },
      });

      expect(result.success).toBe(true);
    });
  });
});
