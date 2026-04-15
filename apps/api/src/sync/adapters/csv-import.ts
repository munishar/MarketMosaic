import type { AMSAdapter, AMSConnectionConfig, AMSPolicy, DateRange, FieldMapping } from '../ams-adapter';

/**
 * CSV/Excel import adapter.
 * Universal fallback adapter that imports policy data from CSV/Excel files.
 * This is the primary working adapter for agencies without API-based AMS access.
 */
export class CSVImportAdapter implements AMSAdapter {
  readonly provider = 'csv_import';
  private connected = false;
  private config: AMSConnectionConfig | null = null;
  private pendingData: Record<string, unknown>[] = [];

  async connect(config: AMSConnectionConfig): Promise<boolean> {
    this.config = config;
    this.connected = true;
    return true;
  }

  /**
   * For CSV import, pullPolicies processes pre-loaded CSV data
   * rather than pulling from an API.
   */
  async pullPolicies(dateRange: DateRange): Promise<AMSPolicy[]> {
    if (!this.connected) {
      throw new Error('Not connected. Call connect() first.');
    }

    const policies: AMSPolicy[] = [];
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);

    for (const row of this.pendingData) {
      const effectiveDate = row.effective_date as string | undefined;
      if (effectiveDate) {
        const date = new Date(effectiveDate);
        if (date >= from && date <= to) {
          policies.push({
            policy_number: (row.policy_number as string) ?? '',
            client_name: (row.client_name as string) ?? (row.insured_name as string) ?? '',
            carrier_name: (row.carrier_name as string) ?? (row.carrier as string) ?? '',
            line_of_business: (row.line_of_business as string) ?? (row.lob as string) ?? '',
            effective_date: effectiveDate,
            expiration_date: (row.expiration_date as string) ?? '',
            premium: row.premium ? Number(row.premium) : undefined,
            status: (row.status as string) ?? 'active',
            raw_data: row,
          });
        }
      }
    }

    return policies;
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
    return { success: true, message: 'CSV import adapter is always available' };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.config = null;
    this.pendingData = [];
  }

  /**
   * Load parsed CSV data into the adapter for processing.
   */
  loadData(rows: Record<string, unknown>[]): void {
    this.pendingData = rows;
  }

  /**
   * Parse a CSV string into rows.
   */
  parseCSV(csvContent: string): Record<string, unknown>[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: Record<string, unknown> = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j].trim();
        }
        rows.push(row);
      }
    }

    return rows;
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
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
