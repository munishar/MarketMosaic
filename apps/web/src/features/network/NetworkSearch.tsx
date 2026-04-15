import React, { useState } from 'react';
import { Search, Route } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { NetworkNode } from './hooks/useNetwork';

interface NetworkSearchProps {
  onSearch: (query: string) => Promise<NetworkNode[]>;
  onFindPath: (from: string, to: string) => Promise<unknown>;
  onNodeSelect?: (node: NetworkNode) => void;
  searchResults: NetworkNode[];
}

export const NetworkSearch: React.FC<NetworkSearchProps> = ({
  onSearch,
  onFindPath,
  onNodeSelect,
  searchResults,
}) => {
  const [mode, setMode] = useState<'search' | 'path'>('search');
  const [query, setQuery] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    await onSearch(query.trim());
    setIsSearching(false);
  };

  const handleFindPath = async () => {
    if (!fromId.trim() || !toId.trim()) return;
    setIsSearching(true);
    await onFindPath(fromId.trim(), toId.trim());
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'search') handleSearch();
      else handleFindPath();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('search')}
          className={`text-xs font-medium px-2 py-1 rounded ${
            mode === 'search'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="h-3 w-3 inline mr-1" />
          Search
        </button>
        <button
          onClick={() => setMode('path')}
          className={`text-xs font-medium px-2 py-1 rounded ${
            mode === 'path'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Route className="h-3 w-3 inline mr-1" />
          Find Path
        </button>
      </div>

      {mode === 'search' ? (
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search contacts in network…"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Button
            onClick={handleSearch}
            isLoading={isSearching}
            size="md"
          >
            Search
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <Input
            label="From (User ID)"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="User ID"
          />
          <Input
            label="To (Contact ID)"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contact ID"
          />
          <Button
            onClick={handleFindPath}
            isLoading={isSearching}
            size="md"
            leftIcon={<Route className="h-4 w-4" />}
          >
            Find Path
          </Button>
        </div>
      )}

      {searchResults.length > 0 && mode === 'search' && (
        <Card padding="sm">
          <ul className="divide-y divide-gray-100">
            {searchResults.map((node) => (
              <li
                key={node.id}
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                onClick={() => onNodeSelect?.(node)}
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {node.label}
                  </span>
                  {node.carrier && (
                    <span className="ml-2 text-xs text-gray-500">
                      {node.carrier}
                    </span>
                  )}
                </div>
                <Badge variant={node.type === 'user' ? 'primary' : 'secondary'}>
                  {node.type}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
