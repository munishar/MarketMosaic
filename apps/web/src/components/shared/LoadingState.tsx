import React from 'react';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  type?: 'table' | 'card' | 'page';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'table',
  rows = 5,
  className,
}) => {
  if (type === 'card') {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className={cn('space-y-6', className)}>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 px-4">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
};
