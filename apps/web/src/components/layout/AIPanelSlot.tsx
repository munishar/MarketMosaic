import React from 'react';
import { Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { AIWorkflowAssistant } from '@/features/ai/AIWorkflowAssistant';

export const AIPanelSlot: React.FC = () => {
  const open = useAppStore((s) => s.ui.aiPanelOpen);
  const setOpen = useAppStore((s) => s.ui.setAIPanelOpen);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 right-0 z-30 w-80 border-l border-gray-200 bg-white transition-transform duration-200 flex flex-col',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-gray-900">AI Assistant</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close AI panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* AI Assistant content */}
      <div className="flex-1 overflow-hidden">
        <AIWorkflowAssistant />
      </div>
    </aside>
  );
};
