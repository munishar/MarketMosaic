import React from 'react';
import { Wrench } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { ChatAction } from './hooks/useAIAssistant';

interface ActionCardProps {
  action: ChatAction;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const entries = Object.entries(action.parameters);

  return (
    <Card className="text-xs" padding="sm">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Wrench className="h-3 w-3 text-secondary" />
        <span className="font-medium text-gray-900">{action.tool_name}</span>
      </div>
      {action.description && (
        <p className="text-gray-500 mb-1.5">{action.description}</p>
      )}
      {entries.length > 0 && (
        <ul className="space-y-0.5">
          {entries.map(([key, value]) => (
            <li key={key} className="flex gap-1">
              <span className="font-medium text-gray-600">{key}:</span>
              <span className="text-gray-500 truncate">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
