export interface WorkflowStage {
  key: string;
  name: string;
  color: string;
  order: number;
  allowed_transitions: string[];
  auto_actions?: {
    event: string;
    action: string;
    params: Record<string, unknown>;
  }[];
}

export interface WorkflowDefinition {
  key: string;
  name: string;
  entity_key: string;
  status_field: string;
  stages: WorkflowStage[];
}
