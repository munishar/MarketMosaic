import { useMemo } from 'react';
import type { EntityDefinition, FieldSchema, UILayout } from '@brokerflow/manifest';
import { useManifest, type ManifestOverrides } from './useManifest';

export interface DynamicEntityData {
  entity: EntityDefinition | undefined;
  fields: FieldSchema[];
  listFields: FieldSchema[];
  formFields: FieldSchema[];
  detailFields: FieldSchema[];
  listLayout: UILayout | undefined;
  createLayout: UILayout | undefined;
  editLayout: UILayout | undefined;
  detailLayout: UILayout | undefined;
}

/**
 * Given an entityKey, combine entity definition + field schemas + UI layouts.
 * Generates synthetic layouts from field schemas when no explicit layout exists.
 */
export function useDynamicEntity(
  entityKey: string,
  overrides?: ManifestOverrides,
): DynamicEntityData {
  const { entities, fields } = useManifest(overrides);

  return useMemo(() => {
    const entity = entities.find((e) => e.key === entityKey);

    const entityFields = fields
      .filter((f) => f.entity_key === entityKey)
      .sort((a, b) => a.display_order - b.display_order);

    const listFields = entityFields.filter((f) => f.show_in_list);
    const formFields = entityFields.filter((f) => f.show_in_form);
    const detailFields = entityFields.filter((f) => f.show_in_detail);

    // Build synthetic layouts from field schemas
    const listLayout: UILayout = {
      key: `${entityKey}_list`,
      entity_key: entityKey,
      layout_type: 'list_view',
      sections: [{ title: 'All Fields', columns: 1, fields: listFields.map((f) => f.field_name) }],
    };

    const createLayout: UILayout = {
      key: `${entityKey}_create`,
      entity_key: entityKey,
      layout_type: 'create_form',
      sections: [{ title: 'Details', columns: 2, fields: formFields.map((f) => f.field_name) }],
    };

    const editLayout: UILayout = {
      key: `${entityKey}_edit`,
      entity_key: entityKey,
      layout_type: 'edit_form',
      sections: [{ title: 'Details', columns: 2, fields: formFields.map((f) => f.field_name) }],
    };

    const detailLayout: UILayout = {
      key: `${entityKey}_detail`,
      entity_key: entityKey,
      layout_type: 'detail_view',
      sections: [{ title: 'Details', columns: 2, fields: detailFields.map((f) => f.field_name) }],
    };

    return {
      entity,
      fields: entityFields,
      listFields,
      formFields,
      detailFields,
      listLayout,
      createLayout,
      editLayout,
      detailLayout,
    };
  }, [entities, fields, entityKey]);
}
