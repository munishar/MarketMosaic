import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

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
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-gray-300 focus:border-primary focus:ring-primary',
            'focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:text-gray-500',
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer',
                  option.value === value
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-50',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setOpen(false);
                  }
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};
