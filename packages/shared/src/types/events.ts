export interface EventMap {
  'client:created': { client_id: string; created_by: string };
  'client:updated': { client_id: string; updated_by: string };
  'contact:created': { contact_id: string; created_by: string };
  'contact:updated': { contact_id: string; updated_by: string };
  'submission:created': {
    submission_id: string;
    client_id: string;
    created_by: string;
  };
  'submission:sent': { submission_id: string; target_ids: string[] };
  'placement:statusChanged': {
    target_id: string;
    submission_id: string;
    old_status: string;
    new_status: string;
  };
  'email:sent': {
    email_id: string;
    submission_id?: string;
    contact_id?: string;
  };
  'email:received': { email_id: string; contact_id?: string };
  'email:parsed': {
    email_id: string;
    target_id?: string;
    confidence: number;
  };
  'email:imported': {
    job_id: string;
    contact_id: string;
    email_count: number;
  };
  'sync:dataStale': {
    entity_type: string;
    entity_id: string;
    freshness_score: number;
  };
  'sync:reconciliationMismatch': {
    job_id: string;
    entity_type: string;
    entity_id: string;
  };
  'config:manifestUpdated': {
    manifest_type: string;
    key: string;
    version: number;
  };
  'notification:created': {
    notification_id: string;
    user_id: string;
    type: string;
  };
  'renewal:upcoming': {
    submission_id: string;
    client_id: string;
    days_until_expiry: number;
  };
}

export type EventName = keyof EventMap;

export type EventPayload<E extends EventName> = EventMap[E];

export type EventHandler<E extends EventName> = (
  payload: EventPayload<E>,
) => void | Promise<void>;
