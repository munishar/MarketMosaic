import { FormPaperType } from '../enums';

/** Insurance form or paper */
export interface FormPaper {
  id: string;
  name: string;
  form_number: string | null;
  carrier_id: string;
  line_of_business_id: string;
  edition_date: string | null;
  type: FormPaperType;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
