import type { AMSAdapter } from '../ams-adapter';
import { AMSProvider } from '@brokerflow/shared';
import { AppliedEpicAdapter } from './applied-epic';
import { AMS360Adapter } from './ams360';
import { CSVImportAdapter } from './csv-import';

/**
 * AMS Adapter registry and factory.
 * Creates the appropriate adapter instance based on provider type.
 */

const adapterConstructors: Record<string, () => AMSAdapter> = {
  [AMSProvider.applied_epic]: () => new AppliedEpicAdapter(),
  [AMSProvider.ams360]: () => new AMS360Adapter(),
  [AMSProvider.csv_import]: () => new CSVImportAdapter(),
  // hawksoft, vertafore, custom_api fall back to CSV for now
  [AMSProvider.hawksoft]: () => new CSVImportAdapter(),
  [AMSProvider.vertafore]: () => new CSVImportAdapter(),
  [AMSProvider.custom_api]: () => new CSVImportAdapter(),
};

/**
 * Create an adapter instance for the given provider.
 */
export function createAdapter(provider: string): AMSAdapter {
  const factory = adapterConstructors[provider];
  if (!factory) {
    // Fall back to CSV import adapter as universal fallback
    return new CSVImportAdapter();
  }
  return factory();
}

/**
 * Get list of supported providers.
 */
export function getSupportedProviders(): string[] {
  return Object.keys(adapterConstructors);
}

export { AppliedEpicAdapter } from './applied-epic';
export { AMS360Adapter } from './ams360';
export { CSVImportAdapter } from './csv-import';
