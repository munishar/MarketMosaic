/**
 * Template merge engine.
 *
 * Resolves `{{entity_type.field_name}}` placeholders in template content.
 * Supported entity types: client, contact, carrier, user (submission support
 * will be added when Agent 6 is implemented).
 *
 * Missing field behaviour is controlled by the `onMissing` option:
 *  - 'leave'  → keep the original `{{…}}` placeholder (default)
 *  - 'empty'  → replace with an empty string
 */

export type OnMissingBehaviour = 'leave' | 'empty';

export interface MergeContext {
  client?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  carrier?: Record<string, unknown>;
  user?: Record<string, unknown>;
  submission?: Record<string, unknown>;
  [entity: string]: Record<string, unknown> | undefined;
}

export interface MergeOptions {
  onMissing?: OnMissingBehaviour;
}

const PLACEHOLDER_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

/**
 * Replace all `{{entity.field}}` tokens in `content` using values from `context`.
 *
 * @param content  - The raw template string
 * @param context  - Map of entity type → record
 * @param options  - Merge options
 * @returns        - The rendered string
 */
export function merge(
  content: string,
  context: MergeContext,
  options: MergeOptions = {},
): string {
  const onMissing = options.onMissing ?? 'leave';

  return content.replace(PLACEHOLDER_REGEX, (original, entityType: string, fieldName: string) => {
    const entity = context[entityType];
    if (!entity) {
      return onMissing === 'empty' ? '' : original;
    }
    const value = entity[fieldName];
    if (value === undefined || value === null) {
      return onMissing === 'empty' ? '' : original;
    }
    return String(value);
  });
}

/**
 * Extract all unique placeholder tokens found in a template string.
 * Returns an array of strings in the form `"entity_type.field_name"`.
 */
export function extractMergeFields(content: string): string[] {
  const fields = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(PLACEHOLDER_REGEX.source, 'g');
  while ((match = re.exec(content)) !== null) {
    fields.add(`${match[1]}.${match[2]}`);
  }
  return Array.from(fields);
}
