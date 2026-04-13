import { ClientStatus } from '../enums';

/** Physical or mailing address */
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  type: string;
}

/** Insured business / client */
export interface Client {
  id: string;
  company_name: string;
  dba: string | null;
  status: ClientStatus;
  industry: string | null;
  naics_code: string | null;
  sic_code: string | null;
  revenue: number | null;
  employee_count: number | null;
  website: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  addresses: Address[];
  assigned_servicer_id: string | null;
  assigned_team_id: string | null;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
