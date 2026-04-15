import { processMessage, type ChatMessage, type OrchestratorOutput } from '../ai/assistant/orchestrator';
import { AppError } from '../middleware/error-handler';
import { isWriteTool } from '../ai/assistant/tools';
import { UserRole } from '@marketmosaic/shared';

// TODO: Persist chat history to Redis or database for scalability across instances and restarts
const chatHistory = new Map<string, ChatMessage[]>();

export interface ChatRequest {
  message: string;
  user: Record<string, unknown>;
  pageContext?: Record<string, string>;
}

export interface ActionExecutionRequest {
  tool_name: string;
  parameters: Record<string, unknown>;
  user: Record<string, unknown>;
}

export async function chat(request: ChatRequest): Promise<OrchestratorOutput & { history: ChatMessage[] }> {
  const userId = request.user.user_id as string;

  // Get or create history
  if (!chatHistory.has(userId)) {
    chatHistory.set(userId, []);
  }
  const history = chatHistory.get(userId)!;

  // Add user message
  history.push({
    role: 'user',
    content: request.message,
    timestamp: new Date().toISOString(),
  });

  // Process with orchestrator
  const result = await processMessage({
    message: request.message,
    user: request.user,
    pageContext: request.pageContext,
    history,
  });

  // Add assistant response
  history.push({
    role: 'assistant',
    content: result.response,
    actions: result.actions.map(a => ({ tool_name: a.tool_name, parameters: a.parameters })),
    timestamp: new Date().toISOString(),
  });

  // Keep history to last 50 messages
  if (history.length > 50) {
    history.splice(0, history.length - 50);
  }

  return { ...result, history };
}

export function getHistory(userId: string): ChatMessage[] {
  return chatHistory.get(userId) ?? [];
}

export function clearHistory(userId: string): void {
  chatHistory.delete(userId);
}

export async function executeAction(request: ActionExecutionRequest): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const { tool_name, parameters, user } = request;
  const role = user.role as string;

  // Permission check: viewers cannot execute write actions
  if (isWriteTool(tool_name) && role === UserRole.viewer) {
    throw new AppError(403, 'FORBIDDEN', 'Viewers cannot execute write actions through the assistant');
  }

  // For now, return a placeholder — actual tool execution would call the respective services
  // This keeps the AI assistant decoupled from direct service imports
  return {
    success: true,
    result: {
      tool_name,
      parameters,
      message: `Action ${tool_name} would be executed with the provided parameters. Integration with service layer pending.`,
    },
  };
}
