export interface FieldSchema {
  key: string;
  entity_key: string;
  field_name: string;
  field_type:
    | 'text'
    | 'number'
    | 'decimal'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'enum'
    | 'reference'
    | 'array'
    | 'json'
    | 'rich_text'
    | 'email'
    | 'phone'
    | 'url'
    | 'address';
  label: string;
  required: boolean;
  show_in_list: boolean;
  show_in_detail: boolean;
  show_in_form: boolean;
  sortable: boolean;
  filterable: boolean;
  searchable: boolean;
  enum_values?: string[];
  reference_entity?: string;
  default_value?: unknown;
  validation_rules?: {
    min?: number;
    max?: number;
    min_length?: number;
    max_length?: number;
    pattern?: string;
  };
  display_order: number;
  column_width?: string;
}
