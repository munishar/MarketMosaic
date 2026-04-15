import React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  const initials = getInitials(firstName || '?', lastName || '?');

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary text-white font-medium',
        sizeClasses[size],
        className,
      )}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
};
