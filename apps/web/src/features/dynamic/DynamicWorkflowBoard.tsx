import React, { useMemo } from 'react';
import type { WorkflowDefinition, WorkflowStage } from '@brokerflow/manifest';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useManifest } from './hooks/useManifest';
import type { ManifestOverrides } from './hooks/useManifest';

export interface DynamicWorkflowBoardProps {
  workflowKey: string;
  items?: Record<string, Record<string, unknown>[]>;
  onItemClick?: (item: Record<string, unknown>, stage: WorkflowStage) => void;
  onTransition?: (
    item: Record<string, unknown>,
    fromStage: string,
    toStage: string,
  ) => void;
  overrides?: ManifestOverrides;
}

/**
 * Config-driven kanban board rendering workflow stages as columns.
 */
export const DynamicWorkflowBoard: React.FC<DynamicWorkflowBoardProps> = ({
  workflowKey,
  items = {},
  onItemClick,
  onTransition,
  overrides,
}) => {
  const { workflows } = useManifest(overrides);

  const workflow: WorkflowDefinition | undefined = useMemo(
    () => workflows.find((w) => w.key === workflowKey),
    [workflows, workflowKey],
  );

  if (!workflow) {
    return <div className="text-gray-500 p-4">Workflow &quot;{workflowKey}&quot; not found</div>;
  }

  const sortedStages = [...workflow.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{workflow.name}</h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStages.map((stage) => {
          const stageItems = items[stage.key] ?? [];

          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Column header */}
              <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                </div>
                <Badge variant="default">{stageItems.length}</Badge>
              </div>

              {/* Items */}
              <div className="p-2 space-y-2 min-h-[100px]">
                {stageItems.map((item, idx) => (
                  <Card
                    key={String(item.id ?? idx)}
                    padding="sm"
                    hoverable
                    onClick={() => onItemClick?.(item, stage)}
                  >
                    <div className="text-sm text-gray-900 font-medium">
                      {String(item.title ?? item.name ?? item.id ?? `Item ${idx + 1}`)}
                    </div>
                    {stage.allowed_transitions.length > 0 && onTransition && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {stage.allowed_transitions.map((target) => {
                          const targetStage = workflow.stages.find((s) => s.key === target);
                          return (
                            <button
                              key={target}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTransition(item, stage.key, target);
                              }}
                              className="text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              → {targetStage?.name ?? target}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                ))}

                {stageItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No items</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicWorkflowBoard;
