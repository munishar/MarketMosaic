import React from 'react';
import { Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

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

      {/* Content placeholder for Agent 15 to populate */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          <div className="text-center">
            <Bot className="mx-auto h-10 w-10 mb-2 opacity-40" />
            <p>AI Assistant will appear here</p>
            <p className="mt-1 text-xs">Ask questions about your data</p>
          </div>
        </div>
      </div>

      {/* Input placeholder */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400">
          Type a message…
        </div>
      </div>
    </aside>
  );
};
