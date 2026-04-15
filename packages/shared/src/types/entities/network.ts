import { RelationshipStrength } from '../enums';

/** Relationship between a user and an external contact */
export interface NetworkRelationship {
  id: string;
  user_id: string;
  contact_id: string;
  strength: RelationshipStrength;
  deals_placed: number;
  last_interaction: string | null;
  notes: string | null;
  introduced_by: string | null;
  created_at: string;
  updated_at: string;
}
