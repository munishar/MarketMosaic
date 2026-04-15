import { describe, it, expect } from 'vitest';
import { buildContext } from '../context';

describe('AssistantContext', () => {
  it('should build context from user and page info', () => {
    const context = buildContext(
      { user_id: 'u1', first_name: 'Alice', last_name: 'Admin', role: 'admin', region: 'West', team_id: 't1' },
      { current_page: 'clients', selected_client_id: 'c1' },
    );

    expect(context.user.id).toBe('u1');
    expect(context.user.name).toBe('Alice Admin');
    expect(context.user.role).toBe('admin');
    expect(context.user.region).toBe('West');
    expect(context.page.current_page).toBe('clients');
    expect(context.page.selected_client_id).toBe('c1');
    expect(context.timestamp).toBeTruthy();
  });

  it('should handle missing fields gracefully', () => {
    const context = buildContext({ user_id: 'u2' });

    expect(context.user.name).toBe('Unknown');
    expect(context.user.role).toBe('viewer');
    expect(context.user.region).toBeNull();
    expect(context.page.current_page).toBe('dashboard');
  });
});
