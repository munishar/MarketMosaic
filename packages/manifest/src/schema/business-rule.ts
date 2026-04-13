export interface RuleCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: unknown;
}

export interface RuleAction {
  type:
    | 'set_field'
    | 'create_notification'
    | 'send_email'
    | 'create_activity'
    | 'trigger_workflow';
  params: Record<string, unknown>;
}

export interface BusinessRule {
  key: string;
  name: string;
  entity_key: string;
  trigger: 'on_create' | 'on_update' | 'on_status_change' | 'on_schedule';
  conditions: RuleCondition[];
  actions: RuleAction[];
  is_active: boolean;
}
