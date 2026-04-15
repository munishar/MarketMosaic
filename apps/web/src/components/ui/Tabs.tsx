import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  className,
}) => {
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey || items[0]?.key || '',
  );

  const activeKey = controlledKey ?? internalKey;

  const handleChange = (key: string) => {
    if (!controlledKey) setInternalKey(key);
    onChange?.(key);
  };

  const activeItem = items.find((item) => item.key === activeKey);

  return (
    <div className={className}>
      <div className="border-b border-gray-200" role="tablist">
        <nav className="flex -mb-px space-x-4">
          {items.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={item.key === activeKey}
              disabled={item.disabled}
              onClick={() => handleChange(item.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                item.key === activeKey
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                item.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
};
