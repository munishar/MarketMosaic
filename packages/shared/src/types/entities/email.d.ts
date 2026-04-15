import { EmailDirection, EmailSource, EmailParseStatus, EmailImportStatus, EnrichmentStatus } from '../enums';
/** File attached to an email */
export interface EmailAttachment {
    filename: string;
    url: string;
    size: number;
    mime_type: string;
}
/** Email message (sent or received) */
export interface Email {
    id: string;
    thread_id: string | null;
    direction: EmailDirection;
    from_address: string;
    to_addresses: string[];
    cc_addresses: string[];
    subject: string;
    body_text: string;
    body_html: string | null;
    sent_at: string;
    client_id: string | null;
    submission_id: string | null;
    contact_id: string | null;
    attachments: EmailAttachment[];
    parsed_data: Record<string, unknown> | null;
    parse_status: EmailParseStatus;
    sent_by_user_id: string | null;
    source: EmailSource;
    import_job_id: string | null;
    external_message_id: string | null;
    created_at: string;
    updated_at: string;
}
/** Background job for importing emails from external provider */
export interface EmailImportJob {
    id: string;
    user_id: string;
    provider: EmailSource;
    oauth_token_encrypted: string;
    date_range_start: string;
    date_range_end: string;
    status: EmailImportStatus;
    total_emails_scanned: number;
    matched_emails: number;
    imported_emails: number;
    matched_contacts: number;
    enrichment_status: EnrichmentStatus;
    progress_percent: number;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
    import_report: Record<string, unknown> | null;
    excluded_contacts: string[];
    incremental_sync_enabled: boolean;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=email.d.ts.map