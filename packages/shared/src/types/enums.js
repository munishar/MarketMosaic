export var UserRole;
(function (UserRole) {
    UserRole["admin"] = "admin";
    UserRole["manager"] = "manager";
    UserRole["servicer"] = "servicer";
    UserRole["viewer"] = "viewer";
})(UserRole || (UserRole = {}));
export var ContactType;
(function (ContactType) {
    ContactType["underwriter"] = "underwriter";
    ContactType["wholesaler"] = "wholesaler";
    ContactType["mga"] = "mga";
    ContactType["other"] = "other";
})(ContactType || (ContactType = {}));
export var CarrierType;
(function (CarrierType) {
    CarrierType["admitted"] = "admitted";
    CarrierType["non_admitted"] = "non_admitted";
    CarrierType["surplus"] = "surplus";
})(CarrierType || (CarrierType = {}));
export var LOBCategory;
(function (LOBCategory) {
    LOBCategory["casualty"] = "casualty";
    LOBCategory["property"] = "property";
    LOBCategory["specialty"] = "specialty";
    LOBCategory["financial_lines"] = "financial_lines";
})(LOBCategory || (LOBCategory = {}));
export var FormPaperType;
(function (FormPaperType) {
    FormPaperType["occurrence"] = "occurrence";
    FormPaperType["claims_made"] = "claims_made";
    FormPaperType["other"] = "other";
})(FormPaperType || (FormPaperType = {}));
export var ClientStatus;
(function (ClientStatus) {
    ClientStatus["prospect"] = "prospect";
    ClientStatus["active"] = "active";
    ClientStatus["inactive"] = "inactive";
    ClientStatus["lost"] = "lost";
})(ClientStatus || (ClientStatus = {}));
export var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["draft"] = "draft";
    SubmissionStatus["submitted"] = "submitted";
    SubmissionStatus["quoted"] = "quoted";
    SubmissionStatus["bound"] = "bound";
    SubmissionStatus["declined"] = "declined";
    SubmissionStatus["expired"] = "expired";
    SubmissionStatus["lost"] = "lost";
})(SubmissionStatus || (SubmissionStatus = {}));
export var SubmissionTargetStatus;
(function (SubmissionTargetStatus) {
    SubmissionTargetStatus["pending"] = "pending";
    SubmissionTargetStatus["submitted"] = "submitted";
    SubmissionTargetStatus["reviewing"] = "reviewing";
    SubmissionTargetStatus["quoted"] = "quoted";
    SubmissionTargetStatus["declined"] = "declined";
    SubmissionTargetStatus["bound"] = "bound";
    SubmissionTargetStatus["expired"] = "expired";
})(SubmissionTargetStatus || (SubmissionTargetStatus = {}));
export var SubmissionPriority;
(function (SubmissionPriority) {
    SubmissionPriority["low"] = "low";
    SubmissionPriority["normal"] = "normal";
    SubmissionPriority["high"] = "high";
    SubmissionPriority["urgent"] = "urgent";
})(SubmissionPriority || (SubmissionPriority = {}));
export var EmailDirection;
(function (EmailDirection) {
    EmailDirection["inbound"] = "inbound";
    EmailDirection["outbound"] = "outbound";
})(EmailDirection || (EmailDirection = {}));
export var EmailSource;
(function (EmailSource) {
    EmailSource["platform"] = "platform";
    EmailSource["import_gmail"] = "import_gmail";
    EmailSource["import_outlook"] = "import_outlook";
})(EmailSource || (EmailSource = {}));
export var EmailParseStatus;
(function (EmailParseStatus) {
    EmailParseStatus["unparsed"] = "unparsed";
    EmailParseStatus["parsed"] = "parsed";
    EmailParseStatus["review_needed"] = "review_needed";
    EmailParseStatus["confirmed"] = "confirmed";
})(EmailParseStatus || (EmailParseStatus = {}));
export var EmailImportStatus;
(function (EmailImportStatus) {
    EmailImportStatus["connecting"] = "connecting";
    EmailImportStatus["scanning"] = "scanning";
    EmailImportStatus["previewing"] = "previewing";
    EmailImportStatus["importing"] = "importing";
    EmailImportStatus["enriching"] = "enriching";
    EmailImportStatus["complete"] = "complete";
    EmailImportStatus["failed"] = "failed";
    EmailImportStatus["cancelled"] = "cancelled";
})(EmailImportStatus || (EmailImportStatus = {}));
export var EnrichmentStatus;
(function (EnrichmentStatus) {
    EnrichmentStatus["pending"] = "pending";
    EnrichmentStatus["in_progress"] = "in_progress";
    EnrichmentStatus["complete"] = "complete";
})(EnrichmentStatus || (EnrichmentStatus = {}));
export var AttachmentType;
(function (AttachmentType) {
    AttachmentType["application"] = "application";
    AttachmentType["loss_run"] = "loss_run";
    AttachmentType["acord_form"] = "acord_form";
    AttachmentType["quote"] = "quote";
    AttachmentType["binder"] = "binder";
    AttachmentType["policy"] = "policy";
    AttachmentType["endorsement"] = "endorsement";
    AttachmentType["other"] = "other";
})(AttachmentType || (AttachmentType = {}));
export var ActivityType;
(function (ActivityType) {
    ActivityType["email_sent"] = "email_sent";
    ActivityType["email_received"] = "email_received";
    ActivityType["submission_created"] = "submission_created";
    ActivityType["quote_received"] = "quote_received";
    ActivityType["bound"] = "bound";
    ActivityType["declined"] = "declined";
    ActivityType["note_added"] = "note_added";
    ActivityType["contact_created"] = "contact_created";
    ActivityType["document_uploaded"] = "document_uploaded";
    ActivityType["renewal_alert"] = "renewal_alert";
})(ActivityType || (ActivityType = {}));
export var EntityType;
(function (EntityType) {
    EntityType["client"] = "client";
    EntityType["contact"] = "contact";
    EntityType["submission"] = "submission";
    EntityType["email"] = "email";
    EntityType["carrier"] = "carrier";
    EntityType["line_of_business"] = "line_of_business";
    EntityType["form_paper"] = "form_paper";
    EntityType["capacity"] = "capacity";
    EntityType["user"] = "user";
    EntityType["team"] = "team";
})(EntityType || (EntityType = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["renewal_upcoming"] = "renewal_upcoming";
    NotificationType["quote_received"] = "quote_received";
    NotificationType["submission_declined"] = "submission_declined";
    NotificationType["network_request"] = "network_request";
    NotificationType["system_alert"] = "system_alert";
})(NotificationType || (NotificationType = {}));
export var RelationshipStrength;
(function (RelationshipStrength) {
    RelationshipStrength["strong"] = "strong";
    RelationshipStrength["moderate"] = "moderate";
    RelationshipStrength["weak"] = "weak";
    RelationshipStrength["new_contact"] = "new_contact";
})(RelationshipStrength || (RelationshipStrength = {}));
export var PreferredContactMethod;
(function (PreferredContactMethod) {
    PreferredContactMethod["email"] = "email";
    PreferredContactMethod["phone"] = "phone";
    PreferredContactMethod["both"] = "both";
})(PreferredContactMethod || (PreferredContactMethod = {}));
export var TemplateType;
(function (TemplateType) {
    TemplateType["email"] = "email";
    TemplateType["document"] = "document";
    TemplateType["cover_letter"] = "cover_letter";
    TemplateType["acord"] = "acord";
})(TemplateType || (TemplateType = {}));
export var SyncScheduleType;
(function (SyncScheduleType) {
    SyncScheduleType["capacity_inquiry"] = "capacity_inquiry";
    SyncScheduleType["ams_sync"] = "ams_sync";
    SyncScheduleType["external_enrichment"] = "external_enrichment";
})(SyncScheduleType || (SyncScheduleType = {}));
export var SyncFrequency;
(function (SyncFrequency) {
    SyncFrequency["daily"] = "daily";
    SyncFrequency["weekly"] = "weekly";
    SyncFrequency["biweekly"] = "biweekly";
    SyncFrequency["monthly"] = "monthly";
    SyncFrequency["quarterly"] = "quarterly";
    SyncFrequency["semi_annual"] = "semi_annual";
    SyncFrequency["annual"] = "annual";
})(SyncFrequency || (SyncFrequency = {}));
export var SyncJobType;
(function (SyncJobType) {
    SyncJobType["capacity_inquiry"] = "capacity_inquiry";
    SyncJobType["ams_sync"] = "ams_sync";
    SyncJobType["external_enrichment"] = "external_enrichment";
    SyncJobType["manual_refresh"] = "manual_refresh";
})(SyncJobType || (SyncJobType = {}));
export var SyncJobStatus;
(function (SyncJobStatus) {
    SyncJobStatus["queued"] = "queued";
    SyncJobStatus["running"] = "running";
    SyncJobStatus["complete"] = "complete";
    SyncJobStatus["partial"] = "partial";
    SyncJobStatus["failed"] = "failed";
    SyncJobStatus["cancelled"] = "cancelled";
})(SyncJobStatus || (SyncJobStatus = {}));
export var DataFreshnessStatus;
(function (DataFreshnessStatus) {
    DataFreshnessStatus["fresh"] = "fresh";
    DataFreshnessStatus["aging"] = "aging";
    DataFreshnessStatus["stale"] = "stale";
    DataFreshnessStatus["refresh_pending"] = "refresh_pending";
    DataFreshnessStatus["refresh_failed"] = "refresh_failed";
})(DataFreshnessStatus || (DataFreshnessStatus = {}));
export var DataFreshnessEntityType;
(function (DataFreshnessEntityType) {
    DataFreshnessEntityType["underwriter_capacity"] = "underwriter_capacity";
    DataFreshnessEntityType["contact"] = "contact";
    DataFreshnessEntityType["carrier"] = "carrier";
    DataFreshnessEntityType["client"] = "client";
    DataFreshnessEntityType["form_paper"] = "form_paper";
})(DataFreshnessEntityType || (DataFreshnessEntityType = {}));
export var VerificationSource;
(function (VerificationSource) {
    VerificationSource["manual"] = "manual";
    VerificationSource["ams_sync"] = "ams_sync";
    VerificationSource["capacity_inquiry_response"] = "capacity_inquiry_response";
    VerificationSource["external_enrichment"] = "external_enrichment";
    VerificationSource["email_import"] = "email_import";
})(VerificationSource || (VerificationSource = {}));
export var AMSProvider;
(function (AMSProvider) {
    AMSProvider["applied_epic"] = "applied_epic";
    AMSProvider["ams360"] = "ams360";
    AMSProvider["hawksoft"] = "hawksoft";
    AMSProvider["vertafore"] = "vertafore";
    AMSProvider["csv_import"] = "csv_import";
    AMSProvider["custom_api"] = "custom_api";
})(AMSProvider || (AMSProvider = {}));
export var AMSConnectionStatus;
(function (AMSConnectionStatus) {
    AMSConnectionStatus["connected"] = "connected";
    AMSConnectionStatus["disconnected"] = "disconnected";
    AMSConnectionStatus["error"] = "error";
    AMSConnectionStatus["testing"] = "testing";
})(AMSConnectionStatus || (AMSConnectionStatus = {}));
export var SyncDirection;
(function (SyncDirection) {
    SyncDirection["inbound"] = "inbound";
    SyncDirection["outbound"] = "outbound";
    SyncDirection["bidirectional"] = "bidirectional";
})(SyncDirection || (SyncDirection = {}));
export var ManifestType;
(function (ManifestType) {
    ManifestType["entity_definition"] = "entity_definition";
    ManifestType["field_schema"] = "field_schema";
    ManifestType["workflow_definition"] = "workflow_definition";
    ManifestType["ui_layout"] = "ui_layout";
    ManifestType["permission_matrix"] = "permission_matrix";
    ManifestType["navigation"] = "navigation";
    ManifestType["business_rule"] = "business_rule";
    ManifestType["validation_rule"] = "validation_rule";
})(ManifestType || (ManifestType = {}));
//# sourceMappingURL=enums.js.map