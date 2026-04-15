import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, GripVertical } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface WorkflowStage {
  name: string;
  color: string;
  allowed_transitions: string[];
}

interface WorkflowDesignerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown> | null;
}

const defaultColors = [
  '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4',
];

function parseStages(data: Record<string, unknown> | null | undefined): WorkflowStage[] {
  if (!data || !Array.isArray(data.stages)) return [];
  return (data.stages as Record<string, unknown>[]).map((s) => ({
    name: String(s.name ?? ''),
    color: String(s.color ?? '#6B7280'),
    allowed_transitions: Array.isArray(s.allowed_transitions)
      ? (s.allowed_transitions as string[])
      : [],
  }));
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [stages, setStages] = useState<WorkflowStage[]>(() =>
    parseStages(initialData),
  );
  const [workflowName, setWorkflowName] = useState(
    String(initialData?.name ?? ''),
  );
  const [isSaving, setIsSaving] = useState(false);

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        name: '',
        color: defaultColors[prev.length % defaultColors.length],
        allowed_transitions: [],
      },
    ]);
  };

  const removeStage = (index: number) => {
    const removedName = stages[index].name;
    setStages((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s) => ({
          ...s,
          allowed_transitions: s.allowed_transitions.filter((t) => t !== removedName),
        })),
    );
  };

  const updateStage = (index: number, updates: Partial<WorkflowStage>) => {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const toggleTransition = (fromIndex: number, toName: string) => {
    setStages((prev) =>
      prev.map((s, i) => {
        if (i !== fromIndex) return s;
        const has = s.allowed_transitions.includes(toName);
        return {
          ...s,
          allowed_transitions: has
            ? s.allowed_transitions.filter((t) => t !== toName)
            : [...s.allowed_transitions, toName],
        };
      }),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ name: workflowName, stages });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Workflow Designer" size="xl">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <Input
          label="Workflow Name"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="e.g. Submission Pipeline"
        />

        {/* Visual pipeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Pipeline Stages</h3>
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3 w-3" />} onClick={addStage}>
              Add Stage
            </Button>
          </div>

          {stages.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center border rounded-md">
              No stages defined. Click "Add Stage" to build your workflow.
            </p>
          ) : (
            <div className="flex items-start gap-2 overflow-x-auto pb-4">
              {stages.map((stage, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className="flex-shrink-0 w-48 rounded-lg border-2 p-3"
                    style={{ borderColor: stage.color }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <button
                        onClick={() => removeStage(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <Input
                      placeholder="Stage name"
                      value={stage.name}
                      onChange={(e) => updateStage(idx, { name: e.target.value })}
                    />

                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Color</label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {defaultColors.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateStage(idx, { color: c })}
                            className={`h-5 w-5 rounded-full border-2 ${
                              stage.color === c ? 'border-gray-800' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Transitions to:</label>
                      <div className="mt-1 space-y-1">
                        {stages
                          .filter((_, i) => i !== idx)
                          .map((target) => (
                            <label
                              key={target.name || `stage-${stages.indexOf(target)}`}
                              className="flex items-center gap-1 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={stage.allowed_transitions.includes(target.name)}
                                onChange={() => toggleTransition(idx, target.name)}
                                className="rounded border-gray-300"
                                disabled={!target.name}
                              />
                              <span>{target.name || '(unnamed)'}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className="flex items-center pt-12">
                      <ArrowRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} isLoading={isSaving}>Save Workflow</Button>
      </div>
    </Dialog>
  );
};
