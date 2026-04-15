import { SyncScheduleType, SyncFrequency, SyncJobType, SyncJobStatus, DataFreshnessStatus, DataFreshnessEntityType, VerificationSource, AMSProvider, AMSConnectionStatus, SyncDirection } from '../enums';
/** Scheduled data synchronization task */
export interface SyncSchedule {
    id: string;
    schedule_type: SyncScheduleType;
    frequency: SyncFrequency;
    next_run_at: string;
    last_run_at: string | null;
    is_active: boolean;
    config: Record<string, unknown>;
    created_by: string;
    created_at: string;
    updated_at: string;
}
/** Individual execution of a sync schedule */
export interface SyncJob {
    id: string;
    schedule_id: string | null;
    job_type: SyncJobType;
    status: SyncJobStatus;
    started_at: string;
    completed_at: string | null;
    records_processed: number;
    records_updated: number;
    records_failed: number;
    error_log: Record<string, unknown>[];
    triggered_by: string;
    created_at: string;
    updated_at: string;
}
/** Data freshness tracking per entity */
export interface DataFreshnessScore {
    id: string;
    entity_type: DataFreshnessEntityType;
    entity_id: string;
    freshness_status: DataFreshnessStatus;
    freshness_score: number;
    last_verified_at: string;
    last_verified_by: string | null;
    verification_source: VerificationSource;
    next_verification_due: string | null;
    created_at: string;
    updated_at: string;
}
/** External AMS system connection */
export interface AMSConnection {
    id: string;
    provider: AMSProvider;
    connection_name: string;
    status: AMSConnectionStatus;
    api_endpoint: string | null;
    sync_direction: SyncDirection;
    last_sync_at: string | null;
    field_mappings: Record<string, unknown>;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=sync.d.ts.map