import { ActivityType, EntityType } from '../enums';

/** Audit / activity log entry */
export interface Activity {
  id: string;
  type: ActivityType;
  entity_type: EntityType;
  entity_id: string;
  user_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}
