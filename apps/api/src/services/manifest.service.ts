import * as manifestQueries from '../queries/manifest.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';
import type { ListParams } from '../queries/carrier.queries';
import type { ManifestFilters } from '../queries/manifest.queries';

export interface ManifestListResult {
  data: Record<string, unknown>[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export async function list(params: ListParams & ManifestFilters): Promise<ManifestListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const { rows, total } = await manifestQueries.findAll({ ...params, page, limit });
  return { data: rows, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getById(id: string): Promise<Record<string, unknown>> {
  const manifest = await manifestQueries.findById(id);
  if (!manifest) throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
  return manifest;
}

export async function create(data: Record<string, unknown>, createdBy: string): Promise<Record<string, unknown>> {
  const manifest = await manifestQueries.create(data, createdBy);

  await eventBus.emit('config:manifestUpdated', {
    manifest_type: manifest.manifest_type as string,
    key: manifest.key as string,
    version: manifest.version as number,
  });

  return manifest;
}

export async function update(id: string, data: Record<string, unknown>, updatedBy: string): Promise<Record<string, unknown>> {
  const existing = await manifestQueries.findById(id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
  if (!existing.is_active) throw new AppError(400, 'VALIDATION_ERROR', 'Cannot update an inactive manifest');

  const manifest = await manifestQueries.update(id, data, updatedBy);
  if (!manifest) throw new AppError(500, 'INTERNAL_ERROR', 'Failed to create new manifest version');

  await eventBus.emit('config:manifestUpdated', {
    manifest_type: manifest.manifest_type as string,
    key: manifest.key as string,
    version: manifest.version as number,
  });

  return manifest;
}

export async function remove(id: string): Promise<void> {
  const success = await manifestQueries.deactivate(id);
  if (!success) throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
}

export async function rollback(id: string): Promise<Record<string, unknown>> {
  const current = await manifestQueries.findById(id);
  if (!current) throw new AppError(404, 'NOT_FOUND', 'Manifest not found');

  const currentVersion = current.version as number;
  if (currentVersion <= 1) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cannot rollback: no previous version exists');
  }

  const targetVersion = currentVersion - 1;
  const previousVersion = await manifestQueries.findByKeyAndVersion(current.key as string, targetVersion);
  if (!previousVersion) {
    throw new AppError(404, 'NOT_FOUND', `Previous version ${targetVersion} not found`);
  }

  const rolledBack = await manifestQueries.rollback(current.key as string, targetVersion);
  if (!rolledBack) throw new AppError(500, 'INTERNAL_ERROR', 'Rollback failed');

  await eventBus.emit('config:manifestUpdated', {
    manifest_type: rolledBack.manifest_type as string,
    key: rolledBack.key as string,
    version: rolledBack.version as number,
  });

  return rolledBack;
}
