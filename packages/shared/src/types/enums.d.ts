export declare enum UserRole {
    admin = "admin",
    manager = "manager",
    servicer = "servicer",
    viewer = "viewer"
}
export declare enum ContactType {
    underwriter = "underwriter",
    wholesaler = "wholesaler",
    mga = "mga",
    other = "other"
}
export declare enum CarrierType {
    admitted = "admitted",
    non_admitted = "non_admitted",
    surplus = "surplus"
}
export declare enum LOBCategory {
    casualty = "casualty",
    property = "property",
    specialty = "specialty",
    financial_lines = "financial_lines"
}
export declare enum FormPaperType {
    occurrence = "occurrence",
    claims_made = "claims_made",
    other = "other"
}
export declare enum ClientStatus {
    prospect = "prospect",
    active = "active",
    inactive = "inactive",
    lost = "lost"
}
export declare enum SubmissionStatus {
    draft = "draft",
    submitted = "submitted",
    quoted = "quoted",
    bound = "bound",
    declined = "declined",
    expired = "expired",
    lost = "lost"
}
export declare enum SubmissionTargetStatus {
    pending = "pending",
    submitted = "submitted",
    reviewing = "reviewing",
    quoted = "quoted",
    declined = "declined",
    bound = "bound",
    expired = "expired"
}
export declare enum SubmissionPriority {
    low = "low",
    normal = "normal",
    high = "high",
    urgent = "urgent"
}
export declare enum EmailDirection {
    inbound = "inbound",
    outbound = "outbound"
}
export declare enum EmailSource {
    platform = "platform",
    import_gmail = "import_gmail",
    import_outlook = "import_outlook"
}
export declare enum EmailParseStatus {
    unparsed = "unparsed",
    parsed = "parsed",
    review_needed = "review_needed",
    confirmed = "confirmed"
}
export declare enum EmailImportStatus {
    connecting = "connecting",
    scanning = "scanning",
    previewing = "previewing",
    importing = "importing",
    enriching = "enriching",
    complete = "complete",
    failed = "failed",
    cancelled = "cancelled"
}
export declare enum EnrichmentStatus {
    pending = "pending",
    in_progress = "in_progress",
    complete = "complete"
}
export declare enum AttachmentType {
    application = "application",
    loss_run = "loss_run",
    acord_form = "acord_form",
    quote = "quote",
    binder = "binder",
    policy = "policy",
    endorsement = "endorsement",
    other = "other"
}
export declare enum ActivityType {
    email_sent = "email_sent",
    email_received = "email_received",
    submission_created = "submission_created",
    quote_received = "quote_received",
    bound = "bound",
    declined = "declined",
    note_added = "note_added",
    contact_created = "contact_created",
    document_uploaded = "document_uploaded",
    renewal_alert = "renewal_alert"
}
export declare enum EntityType {
    client = "client",
    contact = "contact",
    submission = "submission",
    email = "email",
    carrier = "carrier",
    line_of_business = "line_of_business",
    form_paper = "form_paper",
    capacity = "capacity",
    user = "user",
    team = "team"
}
export declare enum NotificationType {
    renewal_upcoming = "renewal_upcoming",
    quote_received = "quote_received",
    submission_declined = "submission_declined",
    network_request = "network_request",
    system_alert = "system_alert"
}
export declare enum RelationshipStrength {
    strong = "strong",
    moderate = "moderate",
    weak = "weak",
    new_contact = "new_contact"
}
export declare enum PreferredContactMethod {
    email = "email",
    phone = "phone",
    both = "both"
}
export declare enum TemplateType {
    email = "email",
    document = "document",
    cover_letter = "cover_letter",
    acord = "acord"
}
export declare enum SyncScheduleType {
    capacity_inquiry = "capacity_inquiry",
    ams_sync = "ams_sync",
    external_enrichment = "external_enrichment"
}
export declare enum SyncFrequency {
    daily = "daily",
    weekly = "weekly",
    biweekly = "biweekly",
    monthly = "monthly",
    quarterly = "quarterly",
    semi_annual = "semi_annual",
    annual = "annual"
}
export declare enum SyncJobType {
    capacity_inquiry = "capacity_inquiry",
    ams_sync = "ams_sync",
    external_enrichment = "external_enrichment",
    manual_refresh = "manual_refresh"
}
export declare enum SyncJobStatus {
    queued = "queued",
    running = "running",
    complete = "complete",
    partial = "partial",
    failed = "failed",
    cancelled = "cancelled"
}
export declare enum DataFreshnessStatus {
    fresh = "fresh",
    aging = "aging",
    stale = "stale",
    refresh_pending = "refresh_pending",
    refresh_failed = "refresh_failed"
}
export declare enum DataFreshnessEntityType {
    underwriter_capacity = "underwriter_capacity",
    contact = "contact",
    carrier = "carrier",
    client = "client",
    form_paper = "form_paper"
}
export declare enum VerificationSource {
    manual = "manual",
    ams_sync = "ams_sync",
    capacity_inquiry_response = "capacity_inquiry_response",
    external_enrichment = "external_enrichment",
    email_import = "email_import"
}
export declare enum AMSProvider {
    applied_epic = "applied_epic",
    ams360 = "ams360",
    hawksoft = "hawksoft",
    vertafore = "vertafore",
    csv_import = "csv_import",
    custom_api = "custom_api"
}
export declare enum AMSConnectionStatus {
    connected = "connected",
    disconnected = "disconnected",
    error = "error",
    testing = "testing"
}
export declare enum SyncDirection {
    inbound = "inbound",
    outbound = "outbound",
    bidirectional = "bidirectional"
}
export declare enum ManifestType {
    entity_definition = "entity_definition",
    field_schema = "field_schema",
    workflow_definition = "workflow_definition",
    ui_layout = "ui_layout",
    permission_matrix = "permission_matrix",
    navigation = "navigation",
    business_rule = "business_rule",
    validation_rule = "validation_rule"
}
//# sourceMappingURL=enums.d.ts.map