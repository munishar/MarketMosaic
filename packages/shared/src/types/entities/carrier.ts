import { CarrierType } from '../enums';

/** Insurance carrier */
export interface Carrier {
  id: string;
  name: string;
  am_best_rating: string | null;
  type: CarrierType;
  website: string | null;
  headquarters_state: string | null;
  appointed: boolean;
  appointment_date: string | null;
  notes: string | null;
  primary_contact_id: string | null;
  available_states: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
