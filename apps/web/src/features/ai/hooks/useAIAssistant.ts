import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ChatAction {
  tool_name: string;
  parameters: Record<string, unknown>;
  description?: string;
  requires_confirmation?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
}

interface ChatResponse {
  response: string;
  actions: ChatAction[];
  has_pending_confirmations: boolean;
  history: ChatMessage[];
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingConfirmations, setHasPendingConfirmations] = useState(false);
  const [pendingActions, setPendingActions] = useState<ChatAction[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: ChatMessage[] }>('/ai/history');
      setMessages(response.data.data ?? []);
    } catch {
      // History may not be available; start fresh
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string, pageContext?: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<{ data: ChatResponse }>('/ai/chat', {
          message,
          page_context: pageContext,
        });

        const data = response.data.data;
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          actions: data.actions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setHasPendingConfirmations(data.has_pending_confirmations);

        if (data.has_pending_confirmations) {
          const confirmableActions = data.actions.filter(
            (a) => a.requires_confirmation,
          );
          setPendingActions(confirmableActions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const executeAction = useCallback(
    async (toolName: string, parameters: Record<string, unknown>) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post<{
          data: { success: boolean; result: unknown };
        }>('/ai/execute-action', {
          tool_name: toolName,
          parameters,
        });

        const resultMessage: ChatMessage = {
          id: `action-${Date.now()}`,
          role: 'assistant',
          content: response.data.data.success
            ? `Action "${toolName}" completed successfully.`
            : `Action "${toolName}" failed.`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, resultMessage]);
        setPendingActions((prev) =>
          prev.filter((a) => a.tool_name !== toolName),
        );
        setHasPendingConfirmations(false);

        return response.data.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to execute action',
        );
        return { success: false, result: null };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    try {
      await apiClient.delete('/ai/history');
      setMessages([]);
      setPendingActions([]);
      setHasPendingConfirmations(false);
    } catch {
      setError('Failed to clear history');
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    hasPendingConfirmations,
    pendingActions,
    sendMessage,
    executeAction,
    clearHistory,
    loadHistory,
  };
}
