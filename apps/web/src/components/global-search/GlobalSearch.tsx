import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Contact, Building2, Send, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useAppStore } from '@/store';
import { apiClient } from '@/lib/api-client';

interface SearchResult {
  id: string;
  type: 'client' | 'contact' | 'carrier' | 'submission' | 'email';
  title: string;
  subtitle?: string;
}

const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; path: string }
> = {
  client: {
    icon: <Users className="h-4 w-4" />,
    label: 'Clients',
    path: '/clients',
  },
  contact: {
    icon: <Contact className="h-4 w-4" />,
    label: 'Contacts',
    path: '/contacts',
  },
  carrier: {
    icon: <Building2 className="h-4 w-4" />,
    label: 'Carriers',
    path: '/carriers',
  },
  submission: {
    icon: <Send className="h-4 w-4" />,
    label: 'Submissions',
    path: '/submissions',
  },
  email: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Emails',
    path: '/email',
  },
};

export const GlobalSearch: React.FC = () => {
  const open = useAppStore((s) => s.ui.globalSearchOpen);
  const setOpen = useAppStore((s) => s.ui.setGlobalSearchOpen);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, 250);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    apiClient
      .get('/search', { params: { q: debouncedQuery } })
      .then(({ data }) => {
        if (!cancelled) {
          setResults((data.data as SearchResult[]) || []);
          setSelectedIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const cfg = typeConfig[result.type];
      if (cfg) {
        navigate(`${cfg.path}/${result.id}`);
      }
      setOpen(false);
    },
    [navigate, setOpen],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [results, selectedIndex, handleSelect, setOpen],
  );

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, contacts, carriers, submissions…"
            className="flex-1 border-none bg-transparent px-3 py-4 text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isSearching && (
            <p className="px-3 py-4 text-sm text-gray-400">Searching…</p>
          )}

          {!isSearching && debouncedQuery.length >= 2 && results.length === 0 && (
            <p className="px-3 py-4 text-sm text-gray-400">
              No results for &quot;{debouncedQuery}&quot;
            </p>
          )}

          {!isSearching && results.length === 0 && debouncedQuery.length < 2 && (
            <p className="px-3 py-4 text-sm text-gray-400">
              Type at least 2 characters to search
            </p>
          )}

          {Object.entries(grouped).map(([type, items]) => {
            const cfg = typeConfig[type] || {
              icon: null,
              label: type,
              path: '/',
            };
            return (
              <div key={type} className="mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase text-gray-400">
                  {cfg.icon}
                  {cfg.label}
                </div>
                {items.map((item) => {
                  const flatIdx = results.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors',
                        flatIdx === selectedIndex
                          ? 'bg-primary/5 text-primary'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      <span className="font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-gray-400">— {item.subtitle}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
          <span>
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">↑↓</kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">↵</kbd>{' '}
            Open
          </span>
          <span>
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1 py-0.5 font-mono">esc</kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  );
};
