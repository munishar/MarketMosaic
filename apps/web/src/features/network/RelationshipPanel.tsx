import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { RelationshipStrength } from '@brokerflow/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { NetworkEdge, NetworkNode } from './hooks/useNetwork';

interface RelationshipPanelProps {
  edge: NetworkEdge | null;
  sourceNode: NetworkNode | null;
  targetNode: NetworkNode | null;
  onSave: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
}

const strengthOptions = [
  { value: RelationshipStrength.new_contact, label: 'New Contact' },
  { value: RelationshipStrength.weak, label: 'Weak' },
  { value: RelationshipStrength.moderate, label: 'Moderate' },
  { value: RelationshipStrength.strong, label: 'Strong' },
];

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({
  edge,
  sourceNode,
  targetNode,
  onSave,
  onClose,
}) => {
  const [strength, setStrength] = useState(edge?.strength ?? RelationshipStrength.new_contact);
  const [dealsPlaced, setDealsPlaced] = useState(String(edge?.deals_placed ?? 0));
  const [notes, setNotes] = useState('');
  const [lastInteraction, setLastInteraction] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!edge) return;
    setIsSaving(true);
    try {
      await onSave(edge.id, {
        strength,
        deals_placed: parseInt(dealsPlaced, 10) || 0,
        notes: notes || null,
        last_interaction: lastInteraction || null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!edge) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 border-l border-gray-200 bg-white shadow-lg flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Edit Relationship
        </h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sourceNode && targetNode && (
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{sourceNode.label}</span>
            {' → '}
            <span className="font-medium text-gray-700">{targetNode.label}</span>
          </div>
        )}

        <Select
          label="Strength"
          options={strengthOptions}
          value={strength}
          onChange={setStrength}
        />

        <Input
          label="Deals Placed"
          type="number"
          min="0"
          value={dealsPlaced}
          onChange={(e) => setDealsPlaced(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Add notes about this relationship…"
          />
        </div>

        <Input
          label="Last Interaction"
          type="date"
          value={lastInteraction}
          onChange={(e) => setLastInteraction(e.target.value)}
        />
      </div>

      <div className="border-t border-gray-200 p-4">
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="h-4 w-4" />}
          className="w-full"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
