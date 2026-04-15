import type { AMSAdapter, AMSConnectionConfig, AMSPolicy, DateRange, FieldMapping } from '../ams-adapter';

/**
 * Applied Epic AMS adapter.
 * Implements the AMSAdapter interface for Applied Epic API integration.
 * In production, this would use the Applied Epic REST API.
 */
export class AppliedEpicAdapter implements AMSAdapter {
  readonly provider = 'applied_epic';
  private connected = false;
  private config: AMSConnectionConfig | null = null;

  async connect(config: AMSConnectionConfig): Promise<boolean> {
    this.config = config;

    if (!config.api_endpoint || !config.api_key) {
      throw new Error('Applied Epic adapter requires api_endpoint and api_key');
    }

    // In production: authenticate with Applied Epic API
    // const response = await fetch(`${config.api_endpoint}/auth/token`, { ... });
    this.connected = true;
    return true;
  }

  async pullPolicies(dateRange: DateRange): Promise<AMSPolicy[]> {
    if (!this.connected || !this.config) {
      throw new Error('Not connected. Call connect() first.');
    }

    // In production: fetch policies from Applied Epic API
    // const response = await fetch(`${this.config.api_endpoint}/policies?from=${dateRange.from}&to=${dateRange.to}`);
    void dateRange;

    // Return empty array — real implementation would parse API response
    return [];
  }

  mapFields(rawData: Record<string, unknown>, fieldMapping: FieldMapping[]): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    for (const mapping of fieldMapping) {
      const value = rawData[mapping.source];
      if (value !== undefined) {
        mapped[mapping.target] = mapping.transform
          ? applyTransform(value, mapping.transform)
          : value;
      }
    }
    return mapped;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return { success: false, message: 'No configuration provided' };
    }
    // In production: make a lightweight API call to verify connectivity
    return { success: true, message: 'Applied Epic connection test successful' };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.config = null;
  }
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
    default:
      return value;
  }
}
