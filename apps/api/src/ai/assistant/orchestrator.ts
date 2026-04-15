import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './system-prompt';
import { buildContext } from './context';
import { toolDefinitions } from './tools';
import { parseAssistantResponse } from './intent-parser';
const MODEL = 'claude-sonnet-4-20250514';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ tool_name: string; parameters: Record<string, unknown>; result?: unknown }>;
  timestamp: string;
}

export interface OrchestratorInput {
  message: string;
  user: Record<string, unknown>;
  pageContext?: Record<string, string>;
  history?: ChatMessage[];
}

export interface OrchestratorOutput {
  response: string;
  actions: Array<{ tool_name: string; parameters: Record<string, unknown>; requires_confirmation: boolean }>;
  has_pending_confirmations: boolean;
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey });
}

export async function processMessage(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const context = buildContext(input.user, input.pageContext);
  const systemPrompt = buildSystemPrompt(context);

  const messages: Anthropic.MessageParam[] = [];

  // Add history
  if (input.history) {
    for (const msg of input.history.slice(-10)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: input.message });

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    tools: toolDefinitions,
    messages,
  });

  // Extract text and tool uses
  let textContent = '';
  const toolUses: Array<{ name: string; input: Record<string, unknown> }> = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      toolUses.push({
        name: block.name,
        input: block.input as Record<string, unknown>,
      });
    }
  }

  const parsed = parseAssistantResponse(textContent, toolUses, [
    'create_contact', 'create_submission', 'add_submission_target',
    'draft_email', 'send_notification', 'trigger_capacity_refresh',
  ]);

  return {
    response: parsed.message,
    actions: parsed.actions.map(a => ({
      tool_name: a.tool_name,
      parameters: a.parameters,
      requires_confirmation: a.requires_confirmation,
    })),
    has_pending_confirmations: parsed.has_pending_confirmations,
  };
}
