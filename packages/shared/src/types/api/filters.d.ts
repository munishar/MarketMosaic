import { ClientStatus, ContactType, CarrierType, LOBCategory, SubmissionStatus, SubmissionPriority, SubmissionTargetStatus, AttachmentType, EmailDirection, EmailParseStatus, ActivityType, EntityType, NotificationType, RelationshipStrength } from '../enums';
/** Generic query params supported by all list endpoints */
export interface ListQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
}
export interface ClientFilters extends ListQueryParams {
    status?: ClientStatus;
    industry?: string;
    assigned_servicer_id?: string;
    assigned_team_id?: string;
    tags?: string[];
}
export interface ContactFilters extends ListQueryParams {
    contact_type?: ContactType;
    carrier_id?: string;
    region?: string;
    lines_of_business?: string[];
}
export interface CarrierFilters extends ListQueryParams {
    type?: CarrierType;
    appointed?: boolean;
    headquarters_state?: string;
}
export interface LineOfBusinessFilters extends ListQueryParams {
    category?: LOBCategory;
    parent_line_id?: string;
}
export interface FormPaperFilters extends ListQueryParams {
    carrier_id?: string;
    line_of_business_id?: string;
}
export interface CapacityFilters extends ListQueryParams {
    contact_id?: string;
    carrier_id?: string;
    line_of_business_id?: string;
    appetite_states?: string[];
}
export interface SubmissionFilters extends ListQueryParams {
    client_id?: string;
    status?: SubmissionStatus;
    priority?: SubmissionPriority;
    created_by?: string;
    effective_date_from?: string;
    effective_date_to?: string;
}
export interface SubmissionTargetFilters extends ListQueryParams {
    submission_id?: string;
    carrier_id?: string;
    contact_id?: string;
    status?: SubmissionTargetStatus;
}
export interface EmailFilters extends ListQueryParams {
    direction?: EmailDirection;
    client_id?: string;
    submission_id?: string;
    contact_id?: string;
    parse_status?: EmailParseStatus;
    date_from?: string;
    date_to?: string;
}
export interface AttachmentFilters extends ListQueryParams {
    type?: AttachmentType;
    client_id?: string;
    submission_id?: string;
    email_id?: string;
}
export interface ActivityFilters extends ListQueryParams {
    type?: ActivityType;
    entity_type?: EntityType;
    entity_id?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
}
export interface NotificationFilters extends ListQueryParams {
    type?: NotificationType;
    is_read?: boolean;
}
export interface NetworkFilters extends ListQueryParams {
    strength?: RelationshipStrength;
    contact_id?: string;
}
//# sourceMappingURL=filters.d.ts.map