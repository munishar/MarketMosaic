import { TemplateType } from '../enums';

/** Reusable email/document template with merge fields */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  merge_fields: string[];
  created_by: string;
  is_shared: boolean;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
