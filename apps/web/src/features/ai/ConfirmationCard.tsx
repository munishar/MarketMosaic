import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ChatAction } from './hooks/useAIAssistant';

interface ConfirmationCardProps {
  action: ChatAction;
  onApprove: (toolName: string, parameters: Record<string, unknown>) => void;
  onReject: () => void;
  isLoading?: boolean;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  action,
  onApprove,
  onReject,
  isLoading,
}) => {
  return (
    <Card className="border-warning/30 bg-warning/5" padding="sm">
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle className="h-4 w-4 text-warning-dark" />
        <span className="text-sm font-medium text-gray-900">
          Confirm Action
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-1">
        {action.description ?? `Execute "${action.tool_name}"?`}
      </p>

      {Object.keys(action.parameters).length > 0 && (
        <ul className="text-xs text-gray-500 mb-3 space-y-0.5">
          {Object.entries(action.parameters).map(([key, value]) => (
            <li key={key}>
              <span className="font-medium">{key}:</span>{' '}
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Check className="h-3.5 w-3.5" />}
          isLoading={isLoading}
          onClick={() => onApprove(action.tool_name, action.parameters)}
          className="bg-success hover:bg-success/90"
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          leftIcon={<X className="h-3.5 w-3.5" />}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    </Card>
  );
};
