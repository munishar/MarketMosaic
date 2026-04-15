import React, { useEffect, useState } from 'react';
import { History, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { useConfig } from './hooks/useConfig';

interface HistoryEntry {
  id: string;
  version: number;
  config: Record<string, unknown>;
  change_notes: string | null;
  created_by: string;
  created_at: string;
}

interface ManifestHistoryProps {
  manifestId: string;
  open: boolean;
  onClose: () => void;
}

export const ManifestHistory: React.FC<ManifestHistoryProps> = ({
  manifestId,
  open,
  onClose,
}) => {
  const { getManifestHistory, history } = useConfig();
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [compareEntry, setCompareEntry] = useState<HistoryEntry | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (open && manifestId) {
      getManifestHistory(manifestId);
    }
  }, [open, manifestId, getManifestHistory]);

  const columns: Column<HistoryEntry>[] = [
    {
      key: 'version',
      header: 'Version',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-primary">v{String(value)}</span>
      ),
    },
    {
      key: 'change_notes',
      header: 'Notes',
      render: (value) => (
        <span className="text-gray-600">{value ? String(value) : '—'}</span>
      ),
    },
    {
      key: 'created_by',
      header: 'Updated By',
    },
    {
      key: 'created_at',
      header: 'Updated At',
      sortable: true,
      render: (value) => formatDateTime(value as string | null),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value, row) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Eye className="h-3 w-3" />}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedEntry && selectedEntry.id !== row.id) {
              setCompareEntry(row);
              setShowDiff(true);
            } else {
              setSelectedEntry(row);
              setCompareEntry(null);
              setShowDiff(true);
            }
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Manifest Version History" size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <History className="h-4 w-4" />
          <span>{history.length} version{history.length !== 1 ? 's' : ''}</span>
        </div>

        <DataTable<HistoryEntry>
          columns={columns}
          data={history}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            setSelectedEntry(row);
            setCompareEntry(null);
            setShowDiff(true);
          }}
          emptyMessage="No version history available"
        />

        {showDiff && selectedEntry && (
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                {compareEntry
                  ? `Diff: v${selectedEntry.version} → v${compareEntry.version}`
                  : `Version ${selectedEntry.version} Config`}
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setShowDiff(false)}>
                Close
              </Button>
            </div>
            {compareEntry ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    v{selectedEntry.version}
                  </p>
                  <pre className="rounded bg-gray-50 p-3 text-xs font-mono overflow-auto max-h-60">
                    {JSON.stringify(selectedEntry.config, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    v{compareEntry.version}
                  </p>
                  <pre className="rounded bg-gray-50 p-3 text-xs font-mono overflow-auto max-h-60">
                    {JSON.stringify(compareEntry.config, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <pre className="rounded bg-gray-50 p-3 text-xs font-mono overflow-auto max-h-60">
                {JSON.stringify(selectedEntry.config, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
