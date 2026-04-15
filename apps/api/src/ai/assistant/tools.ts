import type Anthropic from '@anthropic-ai/sdk';

export type ToolName =
  | 'search_clients'
  | 'get_client'
  | 'search_contacts'
  | 'create_contact'
  | 'search_capacity'
  | 'match_underwriters'
  | 'search_network'
  | 'create_submission'
  | 'add_submission_target'
  | 'get_submission_status'
  | 'send_notification'
  | 'search_emails'
  | 'draft_email'
  | 'check_data_freshness'
  | 'trigger_capacity_refresh'
  | 'get_sync_status'
  | 'get_reconciliation_mismatches';

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: 'search_clients',
    description: 'Search for clients by company name, industry, status, or tags. Returns matching client records.',
    input_schema: {
      type: 'object' as const,
      properties: {
        search: { type: 'string', description: 'Search term (company name, industry, etc.)' },
        status: { type: 'string', enum: ['prospect', 'active', 'inactive', 'lost'], description: 'Filter by client status' },
        limit: { type: 'number', description: 'Maximum results to return (default 10)' },
      },
      required: [],
    },
  },
  {
    name: 'get_client',
    description: 'Get detailed information about a specific client by ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        client_id: { type: 'string', description: 'The client ID' },
      },
      required: ['client_id'],
    },
  },
  {
    name: 'search_contacts',
    description: 'Search for underwriter contacts by name, carrier, region, or line of business.',
    input_schema: {
      type: 'object' as const,
      properties: {
        search: { type: 'string', description: 'Search term (name, email, carrier)' },
        carrier_id: { type: 'string', description: 'Filter by carrier ID' },
        contact_type: { type: 'string', enum: ['underwriter', 'wholesaler', 'mga', 'other'] },
        limit: { type: 'number', description: 'Maximum results (default 10)' },
      },
      required: [],
    },
  },
  {
    name: 'search_capacity',
    description: 'Search underwriter capacity by line of business, carrier, minimum limit, state, or industry class.',
    input_schema: {
      type: 'object' as const,
      properties: {
        line_id: { type: 'string', description: 'Line of business ID' },
        carrier_id: { type: 'string', description: 'Carrier ID' },
        min_limit: { type: 'string', description: 'Minimum coverage limit' },
        state: { type: 'string', description: 'State abbreviation' },
        industry_class: { type: 'string', description: 'Industry class' },
        has_available_capacity: { type: 'boolean', description: 'Only show entries with available capacity' },
      },
      required: [],
    },
  },
  {
    name: 'match_underwriters',
    description: 'Find the best underwriter matches for a client and line of business using the scoring algorithm. Returns ranked results with score breakdowns.',
    input_schema: {
      type: 'object' as const,
      properties: {
        client_id: { type: 'string', description: 'Client ID to match for' },
        line_of_business_id: { type: 'string', description: 'Line of business ID' },
        requested_limit: { type: 'number', description: 'Requested coverage limit amount' },
      },
      required: ['client_id', 'line_of_business_id', 'requested_limit'],
    },
  },
  {
    name: 'search_network',
    description: 'Search the relationship network or find path between users and contacts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search term for contacts' },
        from_user_id: { type: 'string', description: 'Starting user ID for path finding' },
        to_contact_id: { type: 'string', description: 'Target contact ID for path finding' },
      },
      required: [],
    },
  },
  {
    name: 'create_submission',
    description: 'Create a new submission for a client. REQUIRES CONFIRMATION before execution.',
    input_schema: {
      type: 'object' as const,
      properties: {
        client_id: { type: 'string', description: 'Client ID' },
        effective_date: { type: 'string', description: 'Policy effective date (YYYY-MM-DD)' },
        expiration_date: { type: 'string', description: 'Policy expiration date (YYYY-MM-DD)' },
        lines_requested: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              line_of_business_id: { type: 'string' },
              requested_limit: { type: 'string' },
            },
          },
          description: 'Lines of business to include',
        },
        notes: { type: 'string', description: 'Submission notes' },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
      },
      required: ['client_id', 'effective_date', 'expiration_date'],
    },
  },
  {
    name: 'get_submission_status',
    description: 'Get the current status and details of a submission.',
    input_schema: {
      type: 'object' as const,
      properties: {
        submission_id: { type: 'string', description: 'Submission ID' },
      },
      required: ['submission_id'],
    },
  },
  {
    name: 'draft_email',
    description: 'Draft an email to a contact. REQUIRES CONFIRMATION before sending.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to_contact_id: { type: 'string', description: 'Recipient contact ID' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body text' },
        client_id: { type: 'string', description: 'Related client ID' },
        submission_id: { type: 'string', description: 'Related submission ID' },
      },
      required: ['to_contact_id', 'subject', 'body'],
    },
  },
  {
    name: 'check_data_freshness',
    description: 'Check data freshness scores for an entity type or specific record.',
    input_schema: {
      type: 'object' as const,
      properties: {
        entity_type: { type: 'string', enum: ['underwriter_capacity', 'contact', 'carrier', 'client'] },
        entity_id: { type: 'string', description: 'Specific entity ID to check' },
      },
      required: [],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a notification to a user. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string', description: 'Target user ID' },
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification message' },
      },
      required: ['user_id', 'title', 'message'],
    },
  },
];

// Tools that require confirmation before execution
export const WRITE_TOOLS: ToolName[] = [
  'create_contact',
  'create_submission',
  'add_submission_target',
  'draft_email',
  'send_notification',
  'trigger_capacity_refresh',
];

export function isWriteTool(toolName: string): boolean {
  return WRITE_TOOLS.includes(toolName as ToolName);
}
