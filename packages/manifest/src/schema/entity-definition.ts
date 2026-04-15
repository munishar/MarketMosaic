export interface EntityDefinition {
  key: string;
  name: string;
  plural_name: string;
  table_name: string;
  icon: string;
  primary_field: string;
  search_fields: string[];
  default_sort: {
    field: string;
    order: 'asc' | 'desc';
  };
  features: {
    soft_delete: boolean;
    audit_log: boolean;
    activity_feed: boolean;
    attachments: boolean;
  };
}
