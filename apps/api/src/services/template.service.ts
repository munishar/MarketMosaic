import * as templateQueries from '../queries/template.queries';
import { AppError } from '../middleware/error-handler';
import { merge, extractMergeFields, type MergeContext, type OnMissingBehaviour } from './merge.service';
import type { ListParams } from '../queries/carrier.queries';
import type { TemplateFilters } from '../queries/template.queries';

export interface TemplateListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(
  params: ListParams & TemplateFilters,
): Promise<TemplateListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await templateQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const template = await templateQueries.findById(id);
  if (!template) throw new AppError(404, 'NOT_FOUND', 'Template not found');
  return template;
}

export async function create(
  data: Record<string, unknown>,
  createdBy: string,
): Promise<Record<string, unknown>> {
  const content = typeof data.content === 'string' ? data.content : '';
  // Auto-extract merge fields from content if not supplied
  const mergeFields =
    Array.isArray(data.merge_fields) && (data.merge_fields as unknown[]).length > 0
      ? data.merge_fields
      : extractMergeFields(content);

  return templateQueries.create({ ...data, merge_fields: mergeFields }, createdBy);
}

export async function update(
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await getById(id); // 404 if missing / inactive

  // Re-extract merge fields when content changes
  const updated = { ...data };
  if (typeof updated.content === 'string') {
    if (!Array.isArray(updated.merge_fields) || (updated.merge_fields as unknown[]).length === 0) {
      updated.merge_fields = extractMergeFields(updated.content);
    }
  }

  const result = await templateQueries.update(id, updated);
  if (!result) throw new AppError(404, 'NOT_FOUND', 'Template not found');
  return result;
}

export async function remove(id: string): Promise<void> {
  const success = await templateQueries.deactivate(id);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Template not found');
}

export interface RenderInput {
  context: MergeContext;
  on_missing?: OnMissingBehaviour;
}

/**
 * Render a template by resolving all `{{entity.field}}` placeholders
 * using the caller-supplied context (entity data).
 */
export async function render(
  id: string,
  input: RenderInput,
): Promise<{ rendered: string; merge_fields_used: string[] }> {
  const template = await getById(id);
  const content = template.content as string;
  const rendered = merge(content, input.context, { onMissing: input.on_missing ?? 'leave' });
  const mergeFieldsUsed = extractMergeFields(content);
  return { rendered, merge_fields_used: mergeFieldsUsed };
}
