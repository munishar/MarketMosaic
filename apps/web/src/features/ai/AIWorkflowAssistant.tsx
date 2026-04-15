import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Trash2, Bot, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ChatMessage } from './ChatMessage';
import { ConfirmationCard } from './ConfirmationCard';
import { SuggestedActions } from './SuggestedActions';
import { useAIAssistant } from './hooks/useAIAssistant';

export const AIWorkflowAssistant: React.FC = () => {
  const {
    messages,
    isLoading,
    hasPendingConfirmations,
    pendingActions,
    sendMessage,
    executeAction,
    clearHistory,
    loadHistory,
  } = useAIAssistant();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed, location.pathname);
    setInput('');
  }, [input, isLoading, sendMessage, location.pathname]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleSuggestionSelect = useCallback(
    (prompt: string) => {
      sendMessage(prompt, location.pathname);
    },
    [sendMessage, location.pathname],
  );

  const handleApprove = useCallback(
    (toolName: string, parameters: Record<string, unknown>) => {
      executeAction(toolName, parameters);
    },
    [executeAction],
  );

  const handleReject = useCallback(() => {
    // Dismissing confirmation; no action taken
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-400">
              <Bot className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">How can I help you today?</p>
              <p className="mt-1 text-xs">
                Ask about clients, submissions, or renewals
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending confirmations */}
      {hasPendingConfirmations && pendingActions.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2 space-y-2">
          {pendingActions.map((action, idx) => (
            <ConfirmationCard
              key={`${action.tool_name}-${idx}`}
              action={action}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Suggested actions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <SuggestedActions onSelect={handleSuggestionSelect} />
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearHistory}
              aria-label="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowAssistant;
