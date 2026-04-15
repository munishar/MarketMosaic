import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)} role="button" tabIndex={0}>
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement<{ onClick?: React.MouseEventHandler }>(child)) {
              return React.cloneElement(child, {
                onClick: (e: React.MouseEvent) => {
                  child.props.onClick?.(e);
                  setOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  destructive,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left',
        destructive ? 'text-danger hover:bg-danger/5' : 'text-gray-700',
        className,
      )}
    >
      {children}
    </button>
  );
};
