export interface UISection {
  title: string;
  columns: number;
  fields: string[];
  collapsed?: boolean;
}

export interface UILayout {
  key: string;
  entity_key: string;
  layout_type: 'list_view' | 'detail_view' | 'create_form' | 'edit_form';
  sections: UISection[];
}
