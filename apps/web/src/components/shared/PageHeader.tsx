import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  children,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} leftIcon={action.icon}>
            {action.label}
          </Button>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
