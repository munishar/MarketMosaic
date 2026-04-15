export interface AssistantContext {
  user: {
    id: string;
    name: string;
    role: string;
    region: string | null;
    team_id: string | null;
  };
  page: {
    current_page: string;
    selected_client_id?: string;
    selected_submission_id?: string;
    selected_contact_id?: string;
  };
  timestamp: string;
}

export function buildContext(user: Record<string, unknown>, pageContext?: Record<string, string>): AssistantContext {
  return {
    user: {
      id: user.user_id as string,
      name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown',
      role: (user.role as string) ?? 'viewer',
      region: (user.region as string) ?? null,
      team_id: (user.team_id as string) ?? null,
    },
    page: {
      current_page: pageContext?.current_page ?? 'dashboard',
      selected_client_id: pageContext?.selected_client_id,
      selected_submission_id: pageContext?.selected_submission_id,
      selected_contact_id: pageContext?.selected_contact_id,
    },
    timestamp: new Date().toISOString(),
  };
}
