import React, { useCallback, useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { useSubmissions } from './hooks/useSubmissions';
import { cn } from '@/lib/utils';

interface ClientOption {
  id: string;
  company_name: string;
  industry: string | null;
}

interface LOBOption {
  id: string;
  name: string;
  category: string;
}

interface SelectedLine {
  line_of_business_id: string;
  name: string;
  requested_limit: string;
  notes: string;
}

interface MatchedUnderwriter {
  contact_id: string;
  carrier_id: string;
  contact_name: string;
  carrier_name: string;
  line_of_business_id: string;
  score: number;
  capacity_limit: number | null;
  notes: string | null;
}

interface WizardData {
  client: ClientOption | null;
  lines: SelectedLine[];
  selectedUnderwriters: MatchedUnderwriter[];
  effectiveDate: string;
  expirationDate: string;
  priority: string;
  notes: string;
}

const STEPS = [
  'Select Client',
  'Select Lines',
  'Match Underwriters',
  'Review',
  'Confirm & Send',
];

interface SubmissionBuilderProps {
  onComplete: () => void;
  onCancel: () => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                i < currentStep
                  ? 'bg-[#16A34A] text-white'
                  : i === currentStep
                    ? 'bg-[#2E75B6] text-white'
                    : 'bg-gray-200 text-gray-500',
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="mt-1 text-xs text-gray-600 max-w-[80px] text-center">
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 w-12 sm:w-20',
                i < currentStep ? 'bg-[#16A34A]' : 'bg-gray-200',
              )}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

const SelectClientStep: React.FC<{
  selected: ClientOption | null;
  onSelect: (client: ClientOption) => void;
}> = ({ selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientOption[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await apiClient.get('/clients', {
        params: { search: value, limit: 10 },
      });
      setResults(response.data.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select a Client</h3>
      <p className="text-sm text-gray-500">
        Search for the client this submission is for.
      </p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => void handleSearch(e.target.value)}
          placeholder="Search clients by name..."
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-[#2E75B6] focus:outline-none focus:ring-1 focus:ring-[#2E75B6]"
        />
      </div>
      {searching && (
        <p className="text-sm text-gray-400">Searching...</p>
      )}
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {results.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelect(client)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
              selected?.id === client.id
                ? 'bg-[#2E75B6]/10 border border-[#2E75B6] text-[#1B3A5C]'
                : 'hover:bg-gray-50 border border-transparent',
            )}
          >
            <div>
              <span className="font-medium">{client.company_name}</span>
              {client.industry && (
                <span className="ml-2 text-gray-400">{client.industry}</span>
              )}
            </div>
            {selected?.id === client.id && (
              <Check className="h-4 w-4 text-[#2E75B6]" />
            )}
          </button>
        ))}
      </div>
      {selected && (
        <Card padding="sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#16A34A]" />
            <span className="text-sm font-medium text-gray-900">
              Selected: {selected.company_name}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

const SelectLinesStep: React.FC<{
  lines: SelectedLine[];
  onUpdate: (lines: SelectedLine[]) => void;
}> = ({ lines, onUpdate }) => {
  const [lobOptions, setLobOptions] = useState<LOBOption[]>([]);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (loaded) return;
    void (async () => {
      try {
        const response = await apiClient.get('/lines-of-business', {
          params: { limit: 50 },
        });
        setLobOptions(response.data.data ?? []);
      } catch {
        /* leave empty */
      }
      setLoaded(true);
    })();
  }, [loaded]);

  const toggleLine = useCallback(
    (lob: LOBOption) => {
      const exists = lines.find((l) => l.line_of_business_id === lob.id);
      if (exists) {
        onUpdate(lines.filter((l) => l.line_of_business_id !== lob.id));
      } else {
        onUpdate([
          ...lines,
          {
            line_of_business_id: lob.id,
            name: lob.name,
            requested_limit: '',
            notes: '',
          },
        ]);
      }
    },
    [lines, onUpdate],
  );

  const updateLineField = useCallback(
    (lobId: string, field: 'requested_limit' | 'notes', value: string) => {
      onUpdate(
        lines.map((l) =>
          l.line_of_business_id === lobId ? { ...l, [field]: value } : l,
        ),
      );
    },
    [lines, onUpdate],
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Select Lines of Business
      </h3>
      <p className="text-sm text-gray-500">
        Choose which lines to include and specify requested limits.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {lobOptions.map((lob) => {
          const selected = lines.some(
            (l) => l.line_of_business_id === lob.id,
          );
          return (
            <button
              key={lob.id}
              onClick={() => toggleLine(lob)}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                selected
                  ? 'border-[#2E75B6] bg-[#2E75B6]/10 text-[#1B3A5C]'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    selected
                      ? 'border-[#2E75B6] bg-[#2E75B6]'
                      : 'border-gray-300',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="font-medium">{lob.name}</span>
              </div>
              <span className="ml-6 text-xs text-gray-400">{lob.category}</span>
            </button>
          );
        })}
      </div>
      {lines.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Line Details</h4>
          {lines.map((line) => (
            <Card key={line.line_of_business_id} padding="sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="min-w-[140px] text-sm font-medium">
                  {line.name}
                </span>
                <input
                  type="text"
                  placeholder="Requested limit (e.g. 1000000)"
                  value={line.requested_limit}
                  onChange={(e) =>
                    updateLineField(
                      line.line_of_business_id,
                      'requested_limit',
                      e.target.value,
                    )
                  }
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#2E75B6] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={line.notes}
                  onChange={(e) =>
                    updateLineField(
                      line.line_of_business_id,
                      'notes',
                      e.target.value,
                    )
                  }
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#2E75B6] focus:outline-none"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const MatchUnderwritersStep: React.FC<{
  clientId: string;
  lines: SelectedLine[];
  selected: MatchedUnderwriter[];
  onSelect: (underwriters: MatchedUnderwriter[]) => void;
}> = ({ clientId, lines, selected, onSelect }) => {
  const { matchUnderwriters } = useSubmissions();
  const [matches, setMatches] = useState<MatchedUnderwriter[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  React.useEffect(() => {
    if (fetched || !clientId || lines.length === 0) return;
    setFetched(true);
    void (async () => {
      setLoading(true);
      try {
        const allMatches: MatchedUnderwriter[] = [];
        for (const line of lines) {
          const limit = parseInt(line.requested_limit, 10) || 1000000;
          try {
            const result = await matchUnderwriters(
              clientId,
              line.line_of_business_id,
              limit,
            );
            if (Array.isArray(result)) {
              allMatches.push(...(result as MatchedUnderwriter[]));
            }
          } catch {
            /* continue with other lines */
          }
        }
        setMatches(allMatches);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetched, clientId, lines, matchUnderwriters]);

  const toggleUnderwriter = useCallback(
    (uw: MatchedUnderwriter) => {
      const exists = selected.find(
        (s) =>
          s.contact_id === uw.contact_id &&
          s.line_of_business_id === uw.line_of_business_id,
      );
      if (exists) {
        onSelect(
          selected.filter(
            (s) =>
              !(
                s.contact_id === uw.contact_id &&
                s.line_of_business_id === uw.line_of_business_id
              ),
          ),
        );
      } else {
        onSelect([...selected, uw]);
      }
    },
    [selected, onSelect],
  );

  const isSelected = (uw: MatchedUnderwriter) =>
    selected.some(
      (s) =>
        s.contact_id === uw.contact_id &&
        s.line_of_business_id === uw.line_of_business_id,
    );

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Matching Underwriters
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2E75B6]" />
          <span className="ml-3 text-sm text-gray-500">
            Finding best matches...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Match Underwriters
      </h3>
      <p className="text-sm text-gray-500">
        Select underwriters to target. Ranked by match score.
      </p>
      {matches.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-sm text-gray-500">
            No matching underwriters found. You can still proceed and add
            targets manually later.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matches.map((uw) => (
            <button
              key={`${uw.contact_id}-${uw.line_of_business_id}`}
              onClick={() => toggleUnderwriter(uw)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                isSelected(uw)
                  ? 'border-[#2E75B6] bg-[#2E75B6]/5'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {uw.contact_name}
                  </p>
                  <p className="text-xs text-gray-500">{uw.carrier_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-[#EAB308]" />
                  <span className="text-xs font-medium">
                    {Math.round(uw.score * 100)}%
                  </span>
                </div>
              </div>
              {uw.capacity_limit && (
                <p className="mt-1 text-xs text-gray-400">
                  Capacity: ${uw.capacity_limit.toLocaleString()}
                </p>
              )}
              {isSelected(uw) && (
                <div className="mt-2 flex items-center gap-1 text-xs text-[#2E75B6]">
                  <Check className="h-3 w-3" />
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">
        {selected.length} underwriter{selected.length !== 1 ? 's' : ''}{' '}
        selected
      </p>
    </div>
  );
};

const ReviewStep: React.FC<{
  data: WizardData;
  onUpdateData: (updates: Partial<WizardData>) => void;
}> = ({ data, onUpdateData }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Review Submission</h3>

    <Card padding="md">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Client</h4>
      <p className="text-sm">{data.client?.company_name ?? '—'}</p>
    </Card>

    <Card padding="md">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Lines</h4>
      <div className="space-y-1">
        {data.lines.map((l) => (
          <div
            key={l.line_of_business_id}
            className="flex items-center justify-between text-sm"
          >
            <span>{l.name}</span>
            <span className="text-gray-500">
              {l.requested_limit
                ? `$${parseInt(l.requested_limit, 10).toLocaleString()}`
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </Card>

    <Card padding="md">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Targets</h4>
      <p className="text-sm text-gray-500">
        {data.selectedUnderwriters.length} underwriter
        {data.selectedUnderwriters.length !== 1 ? 's' : ''} selected
      </p>
      <div className="mt-1 flex flex-wrap gap-1">
        {data.selectedUnderwriters.map((uw) => (
          <Badge key={`${uw.contact_id}-${uw.line_of_business_id}`} variant="secondary">
            {uw.contact_name} ({uw.carrier_name})
          </Badge>
        ))}
      </div>
    </Card>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Effective Date
        </label>
        <input
          type="date"
          value={data.effectiveDate}
          onChange={(e) => onUpdateData({ effectiveDate: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expiration Date
        </label>
        <input
          type="date"
          value={data.expirationDate}
          onChange={(e) => onUpdateData({ expirationDate: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:outline-none"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Priority
      </label>
      <select
        value={data.priority}
        onChange={(e) => onUpdateData({ priority: e.target.value })}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:outline-none"
      >
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        value={data.notes}
        onChange={(e) => onUpdateData({ notes: e.target.value })}
        rows={3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2E75B6] focus:outline-none"
        placeholder="Additional notes for this submission..."
      />
    </div>
  </div>
);

const ConfirmSendStep: React.FC<{
  data: WizardData;
  isSending: boolean;
  onSend: () => void;
}> = ({ data, isSending }) => (
  <div className="space-y-4 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2E75B6]/10">
      <Send className="h-8 w-8 text-[#2E75B6]" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">
      Ready to Send Submission
    </h3>
    <p className="text-sm text-gray-500">
      This will create a submission for{' '}
      <strong>{data.client?.company_name}</strong> with{' '}
      {data.lines.length} line{data.lines.length !== 1 ? 's' : ''} and{' '}
      {data.selectedUnderwriters.length} target
      {data.selectedUnderwriters.length !== 1 ? 's' : ''}.
    </p>
    {isSending && (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-[#2E75B6]" />
        <span className="ml-2 text-sm text-gray-500">
          Creating submission...
        </span>
      </div>
    )}
  </div>
);

export const SubmissionBuilder: React.FC<SubmissionBuilderProps> = ({
  onComplete,
  onCancel,
}) => {
  const { createSubmission } = useSubmissions();
  const [step, setStep] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const [wizardData, setWizardData] = useState<WizardData>({
    client: null,
    lines: [],
    selectedUnderwriters: [],
    effectiveDate: '',
    expirationDate: '',
    priority: 'normal',
    notes: '',
  });

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return wizardData.client !== null;
      case 1:
        return wizardData.lines.length > 0;
      case 2:
        return true; // underwriters optional
      case 3:
        return (
          wizardData.effectiveDate !== '' && wizardData.expirationDate !== ''
        );
      case 4:
        return !isSending;
      default:
        return false;
    }
  };

  const handleSend = useCallback(async () => {
    if (!wizardData.client) return;
    setIsSending(true);
    try {
      await createSubmission({
        client_id: wizardData.client.id,
        status: 'draft',
        effective_date: wizardData.effectiveDate,
        expiration_date: wizardData.expirationDate,
        lines_requested: wizardData.lines.map((l) => ({
          line_of_business_id: l.line_of_business_id,
          requested_limit: l.requested_limit || null,
          notes: l.notes || null,
        })),
        priority: wizardData.priority,
        notes: wizardData.notes || null,
        targets: wizardData.selectedUnderwriters.map((uw) => ({
          contact_id: uw.contact_id,
          carrier_id: uw.carrier_id,
          line_of_business_id: uw.line_of_business_id,
        })),
      });
      onComplete();
    } catch {
      setIsSending(false);
    }
  }, [wizardData, createSubmission, onComplete]);

  const handleNext = useCallback(() => {
    if (step === 4) {
      void handleSend();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, handleSend]);

  return (
    <div>
      <ProgressBar currentStep={step} />

      <div className="min-h-[300px]">
        {step === 0 && (
          <SelectClientStep
            selected={wizardData.client}
            onSelect={(client) => updateData({ client })}
          />
        )}
        {step === 1 && (
          <SelectLinesStep
            lines={wizardData.lines}
            onUpdate={(lines) => updateData({ lines })}
          />
        )}
        {step === 2 && wizardData.client && (
          <MatchUnderwritersStep
            clientId={wizardData.client.id}
            lines={wizardData.lines}
            selected={wizardData.selectedUnderwriters}
            onSelect={(selectedUnderwriters) =>
              updateData({ selectedUnderwriters })
            }
          />
        )}
        {step === 3 && (
          <ReviewStep data={wizardData} onUpdateData={updateData} />
        )}
        {step === 4 && (
          <ConfirmSendStep
            data={wizardData}
            isSending={isSending}
            onSend={handleSend}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <Button
          variant="outline"
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          leftIcon={step > 0 ? <ChevronLeft className="h-4 w-4" /> : undefined}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canNext()}
          isLoading={isSending}
          leftIcon={
            step === 4 ? (
              <Send className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          }
        >
          {step === 4 ? 'Create Submission' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
