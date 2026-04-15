import React from 'react';
import type { FieldSchema } from '@brokerflow/manifest';
import {
  TextFieldRenderer,
  NumberFieldRenderer,
  EnumFieldRenderer,
  BooleanFieldRenderer,
  DateFieldRenderer,
  RefFieldRenderer,
  AddressFieldRenderer,
  TagsFieldRenderer,
  RichTextFieldRenderer,
} from './renderers';

export interface DynamicFieldRendererProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Routes a field to its appropriate renderer based on field_type.
 */
export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = (props) => {
  const { field } = props;

  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return <TextFieldRenderer {...props} />;

    case 'number':
    case 'decimal':
      return <NumberFieldRenderer {...props} />;

    case 'enum':
      return <EnumFieldRenderer {...props} />;

    case 'boolean':
      return <BooleanFieldRenderer {...props} />;

    case 'date':
    case 'datetime':
      return <DateFieldRenderer {...props} />;

    case 'reference':
      return <RefFieldRenderer {...props} />;

    case 'address':
      return <AddressFieldRenderer {...props} />;

    case 'array':
      return <TagsFieldRenderer {...props} />;

    case 'rich_text':
      return <RichTextFieldRenderer {...props} />;

    case 'json':
      return <RichTextFieldRenderer {...props} />;

    default:
      return <TextFieldRenderer {...props} />;
  }
};
