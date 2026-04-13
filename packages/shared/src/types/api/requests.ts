import {
  UserRole,
  ClientStatus,
  ContactType,
  CarrierType,
  LOBCategory,
  FormPaperType,
  SubmissionStatus,
  SubmissionPriority,
  SubmissionTargetStatus,
  AttachmentType,
  EmailSource,
  TemplateType,
  RelationshipStrength,
  PreferredContactMethod,
  SyncScheduleType,
  SyncFrequency,
  SyncJobType,
  AMSProvider,
  SyncDirection,
  ManifestType,
} from '../enums';
import { Address, SubmissionLine } from '../entities';

// ─── User ────────────────────────────────────────────

export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  region?: string | null;
  team_id?: string | null;
  specialties?: string[];
  phone?: string | null;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

// ─── Team ────────────────────────────────────────────

export interface CreateTeamRequest {
  name: string;
  region?: string | null;
  manager_id?: string | null;
  description?: string | null;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {}

// ─── Client ──────────────────────────────────────────

export interface CreateClientRequest {
  company_name: string;
  dba?: string | null;
  status?: ClientStatus;
  industry?: string | null;
  naics_code?: string | null;
  sic_code?: string | null;
  revenue?: number | null;
  employee_count?: number | null;
  website?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  addresses?: Address[];
  assigned_servicer_id?: string | null;
  assigned_team_id?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

// ─── Contact ─────────────────────────────────────────

export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  contact_type: ContactType;
  title?: string | null;
  carrier_id?: string | null;
  region?: string | null;
  lines_of_business?: string[];
  notes?: string | null;
  tags?: string[];
  preferred_contact_method?: PreferredContactMethod;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

// ─── Carrier ─────────────────────────────────────────

export interface CreateCarrierRequest {
  name: string;
  am_best_rating?: string | null;
  type: CarrierType;
  website?: string | null;
  headquarters_state?: string | null;
  appointed?: boolean;
  appointment_date?: string | null;
  notes?: string | null;
  primary_contact_id?: string | null;
  available_states?: string[];
}

export interface UpdateCarrierRequest extends Partial<CreateCarrierRequest> {}

// ─── Line of Business ────────────────────────────────

export interface CreateLineOfBusinessRequest {
  name: string;
  abbreviation: string;
  category: LOBCategory;
  description?: string | null;
  parent_line_id?: string | null;
}

export interface UpdateLineOfBusinessRequest
  extends Partial<CreateLineOfBusinessRequest> {}

// ─── Form / Paper ────────────────────────────────────

export interface CreateFormPaperRequest {
  name: string;
  form_number?: string | null;
  carrier_id: string;
  line_of_business_id: string;
  edition_date?: string | null;
  type: FormPaperType;
  description?: string | null;
}

export interface UpdateFormPaperRequest
  extends Partial<CreateFormPaperRequest> {}

// ─── Capacity ────────────────────────────────────────

export interface CreateCapacityRequest {
  contact_id: string;
  carrier_id: string;
  line_of_business_id: string;
  form_paper_id?: string | null;
  min_limit?: string | null;
  max_limit?: string | null;
  deployed_capacity?: string | null;
  available_capacity?: string | null;
  sir_range?: string | null;
  deductible_range?: string | null;
  appetite_classes?: string[];
  appetite_states?: string[];
  appetite_notes?: string | null;
}

export interface UpdateCapacityRequest
  extends Partial<CreateCapacityRequest> {}

// ─── Submission ──────────────────────────────────────

export interface CreateSubmissionRequest {
  client_id: string;
  effective_date: string;
  expiration_date: string;
  lines_requested: SubmissionLine[];
  notes?: string | null;
  priority?: SubmissionPriority;
  renewal_of?: string | null;
}

export interface UpdateSubmissionRequest
  extends Partial<CreateSubmissionRequest> {
  status?: SubmissionStatus;
}

// ─── Submission Target ───────────────────────────────

export interface CreateSubmissionTargetRequest {
  submission_id: string;
  contact_id: string;
  carrier_id: string;
  line_of_business_id: string;
  response_due?: string | null;
  notes?: string | null;
}

export interface UpdateSubmissionTargetRequest {
  status?: SubmissionTargetStatus;
  quoted_premium?: number | null;
  quoted_limit?: number | null;
  quoted_deductible?: number | null;
  quoted_terms?: Record<string, unknown> | null;
  decline_reason?: string | null;
  notes?: string | null;
}

// ─── Email ───────────────────────────────────────────

export interface SendEmailRequest {
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body_text: string;
  body_html?: string | null;
  client_id?: string | null;
  submission_id?: string | null;
  contact_id?: string | null;
  thread_id?: string | null;
}

// ─── Email Import ────────────────────────────────────

export interface StartEmailImportRequest {
  provider: EmailSource;
  date_range_start: string;
  date_range_end: string;
  excluded_contacts?: string[];
  incremental_sync_enabled?: boolean;
}

// ─── Attachment ──────────────────────────────────────

export interface CreateAttachmentRequest {
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  type: AttachmentType;
  client_id?: string | null;
  submission_id?: string | null;
  email_id?: string | null;
  description?: string | null;
  tags?: string[];
}

// ─── Template ────────────────────────────────────────

export interface CreateTemplateRequest {
  name: string;
  type: TemplateType;
  content: string;
  merge_fields?: string[];
  is_shared?: boolean;
  category?: string | null;
}

export interface UpdateTemplateRequest
  extends Partial<CreateTemplateRequest> {}

// ─── Network Relationship ────────────────────────────

export interface CreateNetworkRelationshipRequest {
  contact_id: string;
  strength?: RelationshipStrength;
  notes?: string | null;
  introduced_by?: string | null;
}

export interface UpdateNetworkRelationshipRequest
  extends Partial<CreateNetworkRelationshipRequest> {}

// ─── Sync Schedule ───────────────────────────────────

export interface CreateSyncScheduleRequest {
  schedule_type: SyncScheduleType;
  frequency: SyncFrequency;
  config?: Record<string, unknown>;
}

export interface UpdateSyncScheduleRequest
  extends Partial<CreateSyncScheduleRequest> {
  is_active?: boolean;
}

// ─── Sync Job ────────────────────────────────────────

export interface CreateSyncJobRequest {
  schedule_id?: string | null;
  job_type: SyncJobType;
}

// ─── AMS Connection ──────────────────────────────────

export interface CreateAMSConnectionRequest {
  provider: AMSProvider;
  connection_name: string;
  api_endpoint?: string | null;
  sync_direction: SyncDirection;
  field_mappings?: Record<string, unknown>;
}

export interface UpdateAMSConnectionRequest
  extends Partial<CreateAMSConnectionRequest> {
  is_active?: boolean;
}

// ─── Manifest ────────────────────────────────────────

export interface CreateManifestRequest {
  manifest_type: ManifestType;
  key: string;
  config: Record<string, unknown>;
  effective_from: string;
  effective_to?: string | null;
  change_notes?: string | null;
}

export interface UpdateManifestRequest {
  config?: Record<string, unknown>;
  effective_to?: string | null;
  is_active?: boolean;
  change_notes?: string | null;
}

// ─── Auth ────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
