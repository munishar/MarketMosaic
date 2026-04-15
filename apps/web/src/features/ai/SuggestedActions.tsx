import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface SuggestedActionsProps {
  onSelect: (prompt: string) => void;
}

interface SuggestionGroup {
  pattern: RegExp;
  suggestions: string[];
}

const SUGGESTION_GROUPS: SuggestionGroup[] = [
  {
    pattern: /^\/clients/,
    suggestions: [
      'Find underwriters for this client',
      'Create a new submission',
      'Check upcoming renewals for this client',
    ],
  },
  {
    pattern: /^\/submissions/,
    suggestions: [
      'Show pipeline summary',
      'Find best carriers for this submission',
      'Check quote status',
    ],
  },
  {
    pattern: /^\/placements/,
    suggestions: [
      'Show bind ratio trends',
      'Check pending placements',
      'Compare carrier quotes',
    ],
  },
  {
    pattern: /^\/renewals/,
    suggestions: [
      'Show upcoming renewals this month',
      'Check renewal retention rate',
      'Find clients needing renewal outreach',
    ],
  },
  {
    pattern: /^\/network/,
    suggestions: [
      'Find strongest relationships',
      'Suggest introductions',
      'Show network growth',
    ],
  },
  {
    pattern: /^\/carriers/,
    suggestions: [
      'Compare carrier capacity',
      'Show carrier appetite summary',
      'Find carriers for a specific line',
    ],
  },
  {
    pattern: /^\/$/, // Dashboard
    suggestions: [
      'Show pipeline summary',
      'Check upcoming renewals',
      'Show hit ratio trends',
      "Summarize this week's activity",
    ],
  },
];

const DEFAULT_SUGGESTIONS = [
  'Show pipeline summary',
  'Check upcoming renewals',
  'Help me with a submission',
];

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({
  onSelect,
}) => {
  const location = useLocation();

  const group = SUGGESTION_GROUPS.find((g) => g.pattern.test(location.pathname));
  const suggestions = group?.suggestions ?? DEFAULT_SUGGESTIONS;

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          {suggestion}
        </button>
      ))}
    </div>
  );
};
