/**
 * AMS Adapter base interface.
 * All AMS adapters must implement this interface to provide a standard way
 * to connect, pull policies, and map fields from external AMS systems.
 */

export interface DateRange {
  from: string;
  to: string;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;
}

export interface AMSPolicy {
  policy_number: string;
  client_name: string;
  carrier_name: string;
  line_of_business: string;
  effective_date: string;
  expiration_date: string;
  premium?: number;
  status: string;
  raw_data: Record<string, unknown>;
}

export interface AMSConnectionConfig {
  api_endpoint?: string;
  api_key?: string;
  username?: string;
  password?: string;
  tenant_id?: string;
  [key: string]: unknown;
}

export interface AMSAdapter {
  /** Adapter provider name */
  readonly provider: string;

  /** Establish connection to the AMS system */
  connect(config: AMSConnectionConfig): Promise<boolean>;

  /** Pull policies from the AMS system within a date range */
  pullPolicies(dateRange: DateRange): Promise<AMSPolicy[]>;

  /** Map raw data from AMS fields to platform fields using the provided mapping */
  mapFields(rawData: Record<string, unknown>, fieldMapping: FieldMapping[]): Record<string, unknown>;

  /** Test the connection to verify credentials and connectivity */
  testConnection(): Promise<{ success: boolean; message: string }>;

  /** Disconnect from the AMS system */
  disconnect(): Promise<void>;
}
