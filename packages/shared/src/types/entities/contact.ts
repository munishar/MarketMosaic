import { ContactType, PreferredContactMethod } from '../enums';

/** External contact (underwriter, wholesaler, etc.) */
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  contact_type: ContactType;
  title: string | null;
  carrier_id: string | null;
  region: string | null;
  lines_of_business: string[];
  is_active: boolean;
  notes: string | null;
  tags: string[];
  preferred_contact_method: PreferredContactMethod;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
