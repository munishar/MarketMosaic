import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from './hooks/useAIAssistant';
import { ActionCard } from './ActionCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex gap-2 mb-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            isUser
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none',
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.actions && message.actions.length > 0 && (
          <div className="space-y-2 mt-1">
            {message.actions.map((action, idx) => (
              <ActionCard key={`${action.tool_name}-${idx}`} action={action} />
            ))}
          </div>
        )}

        <span className="block text-[10px] text-gray-400">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};
