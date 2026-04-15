import React, { useCallback, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ContactResult {
  id: string;
  name: string;
  email: string;
  carrier_name?: string;
}

interface RecipientPickerProps {
  label: string;
  recipients: string[];
  onChange: (recipients: string[]) => void;
  placeholder?: string;
}

export const RecipientPicker: React.FC<RecipientPickerProps> = ({
  label,
  recipients,
  onChange,
  placeholder = 'Search contacts or type email...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    setShowDropdown(true);
    try {
      const response = await apiClient.get('/contacts', {
        params: { search: value, limit: 8 },
      });
      const contacts = (response.data.data ?? []) as ContactResult[];
      setResults(contacts);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const addRecipient = useCallback(
    (email: string) => {
      const trimmed = email.trim();
      if (trimmed && !recipients.includes(trimmed)) {
        onChange([...recipients, trimmed]);
      }
      setQuery('');
      setResults([]);
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [recipients, onChange],
  );

  const removeRecipient = useCallback(
    (email: string) => {
      onChange(recipients.filter((r) => r !== email));
    },
    [recipients, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'Enter' || e.key === ',') && query.trim()) {
        e.preventDefault();
        addRecipient(query);
      }
      if (e.key === 'Backspace' && !query && recipients.length > 0) {
        removeRecipient(recipients[recipients.length - 1]);
      }
    },
    [query, recipients, addRecipient, removeRecipient],
  );

  const handleBlur = useCallback(() => {
    // Delay to allow click on dropdown results
    setTimeout(() => {
      setShowDropdown(false);
      if (query.trim()) {
        addRecipient(query);
      }
    }, 200);
  }, [query, addRecipient]);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-[38px] flex-wrap items-center gap-1 rounded-md border border-gray-300 px-2 py-1',
          'focus-within:border-[#2E75B6] focus-within:ring-1 focus-within:ring-[#2E75B6]',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {recipients.map((email) => (
          <Badge key={email} variant="primary">
            <span className="flex items-center gap-1 text-xs">
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRecipient(email);
                }}
                className="ml-0.5 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </Badge>
        ))}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => void handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={recipients.length === 0 ? placeholder : ''}
            className="w-full min-w-[120px] border-none bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {showDropdown && (results.length > 0 || searching) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {searching && (
            <div className="px-3 py-2 text-sm text-gray-400">
              <Search className="mr-1 inline h-3 w-3" />
              Searching contacts...
            </div>
          )}
          {results.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addRecipient(contact.email)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-900">{contact.name}</span>
                <span className="ml-2 text-gray-500">{contact.email}</span>
              </div>
              {contact.carrier_name && (
                <span className="text-xs text-gray-400">{contact.carrier_name}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
