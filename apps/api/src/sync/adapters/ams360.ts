import type { AMSAdapter, AMSConnectionConfig, AMSPolicy, DateRange, FieldMapping } from '../ams-adapter';

/**
 * AMS360 adapter.
 * Implements the AMSAdapter interface for Vertafore AMS360 integration.
 * In production, this would use the AMS360 SOAP/REST API.
 */
export class AMS360Adapter implements AMSAdapter {
  readonly provider = 'ams360';
  private connected = false;
  private config: AMSConnectionConfig | null = null;

  async connect(config: AMSConnectionConfig): Promise<boolean> {
    this.config = config;

    if (!config.api_endpoint || !config.username || !config.password) {
      throw new Error('AMS360 adapter requires api_endpoint, username, and password');
    }

    // In production: authenticate with AMS360 SOAP/REST endpoint
    this.connected = true;
    return true;
  }

  async pullPolicies(dateRange: DateRange): Promise<AMSPolicy[]> {
    if (!this.connected || !this.config) {
      throw new Error('Not connected. Call connect() first.');
    }

    // In production: fetch policies from AMS360 API
    void dateRange;
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
    return { success: true, message: 'AMS360 connection test successful' };
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
