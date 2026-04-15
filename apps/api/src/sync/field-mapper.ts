import type { FieldMapping } from './ams-adapter';

/**
 * Dynamic field mapping engine.
 * Maps external AMS fields to platform fields based on configurable mappings.
 */

export interface FieldMappingConfig {
  mappings: FieldMapping[];
  defaults?: Record<string, unknown>;
  ignore_unmapped?: boolean;
}

/**
 * Apply field mappings to transform external data into platform format.
 */
export function applyFieldMappings(
  sourceData: Record<string, unknown>,
  config: FieldMappingConfig,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Apply defaults first
  if (config.defaults) {
    for (const [key, value] of Object.entries(config.defaults)) {
      result[key] = value;
    }
  }

  // Apply mappings
  for (const mapping of config.mappings) {
    const value = getNestedValue(sourceData, mapping.source);
    if (value !== undefined) {
      const transformed = mapping.transform
        ? applyTransform(value, mapping.transform)
        : value;
      setNestedValue(result, mapping.target, transformed);
    }
  }

  // Copy unmapped fields if not ignoring
  if (!config.ignore_unmapped) {
    const mappedSources = new Set(config.mappings.map((m) => m.source));
    for (const [key, value] of Object.entries(sourceData)) {
      if (!mappedSources.has(key) && !(key in result)) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Validate that all required target fields are present after mapping.
 */
export function validateMappingResult(
  result: Record<string, unknown>,
  requiredFields: string[],
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = getNestedValue(result, field);
    return value === undefined || value === null || value === '';
  });
  return { valid: missing.length === 0, missing };
}

/**
 * Generate a reverse mapping (platform → external).
 */
export function reverseMapping(mappings: FieldMapping[]): FieldMapping[] {
  return mappings.map((m) => ({
    source: m.target,
    target: m.source,
    transform: m.transform,
  }));
}

// ─── Helpers ─────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function applyTransform(value: unknown, transform: string): unknown {
  switch (transform) {
    case 'uppercase':
      return typeof value === 'string' ? value.toUpperCase() : value;
    case 'lowercase':
      return typeof value === 'string' ? value.toLowerCase() : value;
    case 'trim':
      return typeof value === 'string' ? value.trim() : value;
    case 'number':
      return Number(value);
    case 'string':
      return String(value);
    case 'boolean':
      return Boolean(value);
    case 'date':
      return typeof value === 'string' ? new Date(value).toISOString() : value;
    default:
      return value;
  }
}
