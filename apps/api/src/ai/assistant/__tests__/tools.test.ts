import { describe, it, expect } from 'vitest';
import { toolDefinitions, isWriteTool, WRITE_TOOLS } from '../tools';

describe('AI Tools', () => {
  it('should define all required tools', () => {
    const toolNames = toolDefinitions.map(t => t.name);
    expect(toolNames).toContain('search_clients');
    expect(toolNames).toContain('match_underwriters');
    expect(toolNames).toContain('search_capacity');
    expect(toolNames).toContain('create_submission');
    expect(toolNames).toContain('draft_email');
    expect(toolNames).toContain('check_data_freshness');
  });

  it('should have valid schema for each tool', () => {
    for (const tool of toolDefinitions) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.input_schema).toBeDefined();
      expect(tool.input_schema.type).toBe('object');
    }
  });

  it('should identify write tools correctly', () => {
    expect(isWriteTool('create_submission')).toBe(true);
    expect(isWriteTool('draft_email')).toBe(true);
    expect(isWriteTool('send_notification')).toBe(true);
    expect(isWriteTool('search_clients')).toBe(false);
    expect(isWriteTool('get_client')).toBe(false);
    expect(isWriteTool('match_underwriters')).toBe(false);
  });

  it('should have WRITE_TOOLS defined', () => {
    expect(WRITE_TOOLS.length).toBeGreaterThan(0);
    for (const tool of WRITE_TOOLS) {
      expect(isWriteTool(tool)).toBe(true);
    }
  });
});
