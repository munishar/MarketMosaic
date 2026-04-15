import { z } from 'zod';
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
  EmailDirection,
  TemplateType,
  RelationshipStrength,
  PreferredContactMethod,
  SyncScheduleType,
  SyncFrequency,
  SyncJobType,
  AMSProvider,
  SyncDirection,
  ManifestType,
  NotificationType,
  ActivityType,
  EntityType,
} from '../types/enums';

// ─── Helpers ─────────────────────────────────────────

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  type: z.string().min(1),
});

const submissionLineSchema = z.object({
  line_of_business_id: z.string().uuid(),
  requested_limit: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ─── Auth ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.nativeEnum(UserRole).optional(),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

// ─── List Query Params ───────────────────────────────

export const listQueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// ─── User ────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  region: z.string().nullable().optional(),
  team_id: z.string().uuid().nullable().optional(),
  specialties: z.array(z.string()).optional(),
  phone: z.string().nullable().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// ─── Team ────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z.string().min(1),
  region: z.string().nullable().optional(),
  manager_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

// ─── Client ──────────────────────────────────────────

export const createClientSchema = z.object({
  company_name: z.string().min(1),
  dba: z.string().nullable().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  industry: z.string().nullable().optional(),
  naics_code: z.string().nullable().optional(),
  sic_code: z.string().nullable().optional(),
  revenue: z.number().nullable().optional(),
  employee_count: z.number().int().nullable().optional(),
  website: z.string().url().nullable().optional(),
  primary_contact_name: z.string().nullable().optional(),
  primary_contact_email: z.string().email().nullable().optional(),
  primary_contact_phone: z.string().nullable().optional(),
  addresses: z.array(addressSchema).optional(),
  assigned_servicer_id: z.string().uuid().nullable().optional(),
  assigned_team_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ─── Contact ─────────────────────────────────────────

export const createContactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  contact_type: z.nativeEnum(ContactType),
  title: z.string().nullable().optional(),
  carrier_id: z.string().uuid().nullable().optional(),
  region: z.string().nullable().optional(),
  lines_of_business: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  preferred_contact_method: z.nativeEnum(PreferredContactMethod).optional(),
});

export const updateContactSchema = createContactSchema.partial();

// ─── Carrier ─────────────────────────────────────────

export const createCarrierSchema = z.object({
  name: z.string().min(1),
  am_best_rating: z.string().nullable().optional(),
  type: z.nativeEnum(CarrierType),
  website: z.string().url().nullable().optional(),
  headquarters_state: z.string().nullable().optional(),
  appointed: z.boolean().optional(),
  appointment_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  primary_contact_id: z.string().uuid().nullable().optional(),
  available_states: z.array(z.string()).optional(),
});

export const updateCarrierSchema = createCarrierSchema.partial();

// ─── Line of Business ────────────────────────────────

export const createLineOfBusinessSchema = z.object({
  name: z.string().min(1),
  abbreviation: z.string().min(1),
  category: z.nativeEnum(LOBCategory),
  description: z.string().nullable().optional(),
  parent_line_id: z.string().uuid().nullable().optional(),
});

export const updateLineOfBusinessSchema = createLineOfBusinessSchema.partial();

// ─── Form / Paper ────────────────────────────────────

export const createFormPaperSchema = z.object({
  name: z.string().min(1),
  form_number: z.string().nullable().optional(),
  carrier_id: z.string().uuid(),
  line_of_business_id: z.string().uuid(),
  edition_date: z.string().nullable().optional(),
  type: z.nativeEnum(FormPaperType),
  description: z.string().nullable().optional(),
});

export const updateFormPaperSchema = createFormPaperSchema.partial();

// ─── Capacity ────────────────────────────────────────

export const createCapacitySchema = z.object({
  contact_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  line_of_business_id: z.string().uuid(),
  form_paper_id: z.string().uuid().nullable().optional(),
  min_limit: z.string().nullable().optional(),
  max_limit: z.string().nullable().optional(),
  deployed_capacity: z.string().nullable().optional(),
  available_capacity: z.string().nullable().optional(),
  sir_range: z.string().nullable().optional(),
  deductible_range: z.string().nullable().optional(),
  appetite_classes: z.array(z.string()).optional(),
  appetite_states: z.array(z.string()).optional(),
  appetite_notes: z.string().nullable().optional(),
});

export const updateCapacitySchema = createCapacitySchema.partial();

// ─── Submission ──────────────────────────────────────

export const createSubmissionSchema = z.object({
  client_id: z.string().uuid(),
  effective_date: z.string().min(1),
  expiration_date: z.string().min(1),
  lines_requested: z.array(submissionLineSchema).min(1),
  notes: z.string().nullable().optional(),
  priority: z.nativeEnum(SubmissionPriority).optional(),
  renewal_of: z.string().uuid().nullable().optional(),
});

export const updateSubmissionSchema = createSubmissionSchema.partial().extend({
  status: z.nativeEnum(SubmissionStatus).optional(),
});

// ─── Submission Target ───────────────────────────────

export const createSubmissionTargetSchema = z.object({
  submission_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  line_of_business_id: z.string().uuid(),
  response_due: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateSubmissionTargetSchema = z.object({
  status: z.nativeEnum(SubmissionTargetStatus).optional(),
  quoted_premium: z.number().nullable().optional(),
  quoted_limit: z.number().nullable().optional(),
  quoted_deductible: z.number().nullable().optional(),
  quoted_terms: z.record(z.string(), z.unknown()).nullable().optional(),
  decline_reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ─── Email ───────────────────────────────────────────

export const sendEmailSchema = z.object({
  to_addresses: z.array(z.string().email()).min(1),
  cc_addresses: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  body_text: z.string().min(1),
  body_html: z.string().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
  submission_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),
  thread_id: z.string().nullable().optional(),
});

// ─── Email Import ────────────────────────────────────

export const startEmailImportSchema = z.object({
  provider: z.nativeEnum(EmailSource),
  date_range_start: z.string().min(1),
  date_range_end: z.string().min(1),
  excluded_contacts: z.array(z.string()).optional(),
  incremental_sync_enabled: z.boolean().optional(),
});

// ─── Attachment ──────────────────────────────────────

export const createAttachmentSchema = z.object({
  filename: z.string().min(1),
  file_url: z.string().url(),
  file_size: z.number().int().positive(),
  mime_type: z.string().min(1),
  type: z.nativeEnum(AttachmentType),
  client_id: z.string().uuid().nullable().optional(),
  submission_id: z.string().uuid().nullable().optional(),
  email_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Activity ────────────────────────────────────────

export const createActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  entity_type: z.nativeEnum(EntityType),
  entity_id: z.string().uuid(),
  summary: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Template ────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(TemplateType),
  content: z.string().min(1),
  merge_fields: z.array(z.string()).optional(),
  is_shared: z.boolean().optional(),
  category: z.string().nullable().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// ─── Notification ────────────────────────────────────

export const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1),
  message: z.string().min(1),
  action_url: z.string().nullable().optional(),
});

// ─── Network Relationship ────────────────────────────

export const createNetworkRelationshipSchema = z.object({
  contact_id: z.string().uuid(),
  strength: z.nativeEnum(RelationshipStrength).optional(),
  notes: z.string().nullable().optional(),
  introduced_by: z.string().uuid().nullable().optional(),
});

export const updateNetworkRelationshipSchema =
  createNetworkRelationshipSchema.partial();

// ─── Sync Schedule ───────────────────────────────────

export const createSyncScheduleSchema = z.object({
  schedule_type: z.nativeEnum(SyncScheduleType),
  frequency: z.nativeEnum(SyncFrequency),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const updateSyncScheduleSchema = createSyncScheduleSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  });

// ─── Sync Job ────────────────────────────────────────

export const createSyncJobSchema = z.object({
  schedule_id: z.string().uuid().nullable().optional(),
  job_type: z.nativeEnum(SyncJobType),
});

// ─── AMS Connection ──────────────────────────────────

export const createAMSConnectionSchema = z.object({
  provider: z.nativeEnum(AMSProvider),
  connection_name: z.string().min(1),
  api_endpoint: z.string().url().nullable().optional(),
  sync_direction: z.nativeEnum(SyncDirection),
  field_mappings: z.record(z.string(), z.unknown()).optional(),
});

export const updateAMSConnectionSchema = createAMSConnectionSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  });

// ─── Manifest ────────────────────────────────────────

export const createManifestSchema = z.object({
  manifest_type: z.nativeEnum(ManifestType),
  key: z.string().min(1),
  config: z.record(z.string(), z.unknown()),
  effective_from: z.string().min(1),
  effective_to: z.string().nullable().optional(),
  change_notes: z.string().nullable().optional(),
});

export const updateManifestSchema = z.object({
  config: z.record(z.string(), z.unknown()).optional(),
  effective_to: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  change_notes: z.string().nullable().optional(),
});

// ─── Email (direction-based, for incoming email records) ─────

export const createEmailRecordSchema = z.object({
  thread_id: z.string().nullable().optional(),
  direction: z.nativeEnum(EmailDirection),
  from_address: z.string().email(),
  to_addresses: z.array(z.string().email()).min(1),
  cc_addresses: z.array(z.string().email()).optional(),
  subject: z.string().min(1),
  body_text: z.string().min(1),
  body_html: z.string().nullable().optional(),
  sent_at: z.string().min(1),
  client_id: z.string().uuid().nullable().optional(),
  submission_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),
  source: z.nativeEnum(EmailSource).optional(),
});
