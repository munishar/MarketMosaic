-- marketmosaic DDL Schema
-- Complete database definition for the marketmosaic commercial insurance broker platform

-- =============================================================================
-- Extensions & Utility Functions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PostgreSQL Enum Types (matching packages/shared/src/types/enums.ts)
-- =============================================================================

CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'servicer', 'viewer');

CREATE TYPE contact_type_enum AS ENUM ('underwriter', 'wholesaler', 'mga', 'other');

CREATE TYPE carrier_type_enum AS ENUM ('admitted', 'non_admitted', 'surplus');

CREATE TYPE lob_category_enum AS ENUM ('casualty', 'property', 'specialty', 'financial_lines');

CREATE TYPE form_paper_type_enum AS ENUM ('occurrence', 'claims_made', 'other');

CREATE TYPE client_status_enum AS ENUM ('prospect', 'active', 'inactive', 'lost');

CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted', 'quoted', 'bound', 'declined', 'expired', 'lost');

CREATE TYPE submission_target_status_enum AS ENUM ('pending', 'submitted', 'reviewing', 'quoted', 'declined', 'bound', 'expired');

CREATE TYPE submission_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TYPE email_direction_enum AS ENUM ('inbound', 'outbound');

CREATE TYPE email_source_enum AS ENUM ('platform', 'import_gmail', 'import_outlook');

CREATE TYPE email_parse_status_enum AS ENUM ('unparsed', 'parsed', 'review_needed', 'confirmed');

CREATE TYPE email_import_status_enum AS ENUM ('connecting', 'scanning', 'previewing', 'importing', 'enriching', 'complete', 'failed', 'cancelled');

CREATE TYPE enrichment_status_enum AS ENUM ('pending', 'in_progress', 'complete');

CREATE TYPE attachment_type_enum AS ENUM ('application', 'loss_run', 'acord_form', 'quote', 'binder', 'policy', 'endorsement', 'other');

CREATE TYPE activity_type_enum AS ENUM ('email_sent', 'email_received', 'submission_created', 'quote_received', 'bound', 'declined', 'note_added', 'contact_created', 'document_uploaded', 'renewal_alert');

CREATE TYPE entity_type_enum AS ENUM ('client', 'contact', 'submission', 'email', 'carrier', 'line_of_business', 'form_paper', 'capacity', 'user', 'team');

CREATE TYPE notification_type_enum AS ENUM ('renewal_upcoming', 'quote_received', 'submission_declined', 'network_request', 'system_alert');

CREATE TYPE relationship_strength_enum AS ENUM ('strong', 'moderate', 'weak', 'new_contact');

CREATE TYPE preferred_contact_method_enum AS ENUM ('email', 'phone', 'both');

CREATE TYPE template_type_enum AS ENUM ('email', 'document', 'cover_letter', 'acord');

CREATE TYPE sync_schedule_type_enum AS ENUM ('capacity_inquiry', 'ams_sync', 'external_enrichment');

CREATE TYPE sync_frequency_enum AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual');

CREATE TYPE sync_job_type_enum AS ENUM ('capacity_inquiry', 'ams_sync', 'external_enrichment', 'manual_refresh');

CREATE TYPE sync_job_status_enum AS ENUM ('queued', 'running', 'complete', 'partial', 'failed', 'cancelled');

CREATE TYPE data_freshness_status_enum AS ENUM ('fresh', 'aging', 'stale', 'refresh_pending', 'refresh_failed');

CREATE TYPE data_freshness_entity_type_enum AS ENUM ('underwriter_capacity', 'contact', 'carrier', 'client', 'form_paper');

CREATE TYPE verification_source_enum AS ENUM ('manual', 'ams_sync', 'capacity_inquiry_response', 'external_enrichment', 'email_import');

CREATE TYPE ams_provider_enum AS ENUM ('applied_epic', 'ams360', 'hawksoft', 'vertafore', 'csv_import', 'custom_api');

CREATE TYPE ams_connection_status_enum AS ENUM ('connected', 'disconnected', 'error', 'testing');

CREATE TYPE sync_direction_enum AS ENUM ('inbound', 'outbound', 'bidirectional');

CREATE TYPE manifest_type_enum AS ENUM ('entity_definition', 'field_schema', 'workflow_definition', 'ui_layout', 'permission_matrix', 'navigation', 'business_rule', 'validation_rule');

-- =============================================================================
-- Table 1: teams
-- =============================================================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  manager_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- =============================================================================
-- Table 2: users
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'servicer',
  region VARCHAR(100),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  specialties TEXT[] DEFAULT '{}',
  phone VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Deferred FK: teams.manager_id -> users
ALTER TABLE teams ADD CONSTRAINT fk_teams_manager
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Deferred FK: teams.created_by/updated_by -> users
ALTER TABLE teams ADD CONSTRAINT fk_teams_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE teams ADD CONSTRAINT fk_teams_updated_by
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- users self-referencing created_by/updated_by
ALTER TABLE users ADD CONSTRAINT fk_users_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_updated_by
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================================================
-- Table 3: clients
-- =============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  dba VARCHAR(255),
  status client_status_enum NOT NULL DEFAULT 'prospect',
  industry VARCHAR(255),
  naics_code VARCHAR(10),
  sic_code VARCHAR(10),
  revenue DECIMAL(15,2),
  employee_count INTEGER,
  website VARCHAR(500),
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  addresses JSONB NOT NULL DEFAULT '[]',
  assigned_servicer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 4: carriers
-- =============================================================================

CREATE TABLE carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  am_best_rating VARCHAR(10),
  type carrier_type_enum NOT NULL DEFAULT 'admitted',
  website VARCHAR(500),
  headquarters_state VARCHAR(2),
  appointed BOOLEAN NOT NULL DEFAULT false,
  appointment_date DATE,
  notes TEXT,
  primary_contact_id UUID,
  available_states TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 5: contacts
-- =============================================================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  contact_type contact_type_enum NOT NULL DEFAULT 'underwriter',
  title VARCHAR(255),
  carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
  region VARCHAR(100),
  lines_of_business UUID[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  preferred_contact_method preferred_contact_method_enum NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Deferred FK: carriers.primary_contact_id -> contacts
ALTER TABLE carriers ADD CONSTRAINT fk_carriers_primary_contact
  FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- =============================================================================
-- Table 7: lines_of_business
-- =============================================================================

CREATE TABLE lines_of_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(20) NOT NULL,
  category lob_category_enum NOT NULL,
  description TEXT,
  parent_line_id UUID REFERENCES lines_of_business(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 8: form_papers
-- =============================================================================

CREATE TABLE form_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  form_number VARCHAR(50),
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  line_of_business_id UUID NOT NULL REFERENCES lines_of_business(id) ON DELETE CASCADE,
  edition_date DATE,
  type form_paper_type_enum NOT NULL DEFAULT 'occurrence',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 9: underwriter_capacity
-- =============================================================================

CREATE TABLE underwriter_capacity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  line_of_business_id UUID NOT NULL REFERENCES lines_of_business(id) ON DELETE CASCADE,
  form_paper_id UUID REFERENCES form_papers(id) ON DELETE SET NULL,
  min_limit DECIMAL(15,2),
  max_limit DECIMAL(15,2),
  deployed_capacity DECIMAL(15,2),
  available_capacity DECIMAL(15,2),
  sir_range VARCHAR(100),
  deductible_range VARCHAR(100),
  appetite_classes TEXT[] DEFAULT '{}',
  appetite_states TEXT[] DEFAULT '{}',
  appetite_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 10: submissions
-- =============================================================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status submission_status_enum NOT NULL DEFAULT 'draft',
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  lines_requested JSONB NOT NULL DEFAULT '[]',
  submission_date DATE,
  notes TEXT,
  priority submission_priority_enum NOT NULL DEFAULT 'normal',
  renewal_of UUID REFERENCES submissions(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 11: submission_targets
-- =============================================================================

CREATE TABLE submission_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  line_of_business_id UUID NOT NULL REFERENCES lines_of_business(id) ON DELETE CASCADE,
  status submission_target_status_enum NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  response_due DATE,
  quoted_premium DECIMAL(15,2),
  quoted_limit DECIMAL(15,2),
  quoted_deductible DECIMAL(15,2),
  quoted_terms JSONB,
  decline_reason TEXT,
  notes TEXT,
  email_thread_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- Table 12: emails
-- =============================================================================

CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID,
  direction email_direction_enum NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  to_addresses TEXT[] NOT NULL DEFAULT '{}',
  cc_addresses TEXT[] DEFAULT '{}',
  subject VARCHAR(500) NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  sent_at TIMESTAMPTZ NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  attachments JSONB NOT NULL DEFAULT '[]',
  parsed_data JSONB,
  parse_status email_parse_status_enum NOT NULL DEFAULT 'unparsed',
  sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source email_source_enum NOT NULL DEFAULT 'platform',
  import_job_id UUID,
  external_message_id VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 13: email_import_jobs
-- =============================================================================

CREATE TABLE email_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider email_source_enum NOT NULL,
  oauth_token_encrypted TEXT NOT NULL,
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,
  status email_import_status_enum NOT NULL DEFAULT 'connecting',
  total_emails_scanned INTEGER NOT NULL DEFAULT 0,
  matched_emails INTEGER NOT NULL DEFAULT 0,
  imported_emails INTEGER NOT NULL DEFAULT 0,
  matched_contacts INTEGER NOT NULL DEFAULT 0,
  enrichment_status enrichment_status_enum NOT NULL DEFAULT 'pending',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  import_report JSONB,
  excluded_contacts UUID[] DEFAULT '{}',
  incremental_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deferred FK: emails.import_job_id -> email_import_jobs
ALTER TABLE emails ADD CONSTRAINT fk_emails_import_job
  FOREIGN KEY (import_job_id) REFERENCES email_import_jobs(id) ON DELETE SET NULL;

-- =============================================================================
-- Table 14: attachments
-- =============================================================================

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(500) NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  type attachment_type_enum NOT NULL DEFAULT 'other',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  email_id UUID REFERENCES emails(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 15: activities
-- =============================================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type_enum NOT NULL,
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 16: templates
-- =============================================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type template_type_enum NOT NULL,
  content TEXT NOT NULL,
  merge_fields TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  category VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 17: notifications
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 18: network_relationships
-- =============================================================================

CREATE TABLE network_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  strength relationship_strength_enum NOT NULL DEFAULT 'new_contact',
  deals_placed INTEGER NOT NULL DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  notes TEXT,
  introduced_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- =============================================================================
-- Table 19: sync_schedules
-- =============================================================================

CREATE TABLE sync_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type sync_schedule_type_enum NOT NULL,
  frequency sync_frequency_enum NOT NULL DEFAULT 'monthly',
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  target_scope JSONB,
  follow_up_config JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 20: sync_jobs
-- =============================================================================

CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES sync_schedules(id) ON DELETE SET NULL,
  job_type sync_job_type_enum NOT NULL,
  status sync_job_status_enum NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  error_log JSONB NOT NULL DEFAULT '[]',
  summary JSONB,
  triggered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 21: data_freshness_scores
-- =============================================================================

CREATE TABLE data_freshness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type data_freshness_entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  freshness_status data_freshness_status_enum NOT NULL DEFAULT 'fresh',
  freshness_score INTEGER NOT NULL DEFAULT 100,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_source verification_source_enum NOT NULL DEFAULT 'manual',
  next_verification_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 22: ams_connections
-- =============================================================================

CREATE TABLE ams_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider ams_provider_enum NOT NULL,
  connection_name VARCHAR(255) NOT NULL,
  status ams_connection_status_enum NOT NULL DEFAULT 'disconnected',
  api_endpoint VARCHAR(500),
  sync_direction sync_direction_enum NOT NULL DEFAULT 'inbound',
  last_sync_at TIMESTAMPTZ,
  connection_config JSONB,
  field_mapping JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 23: platform_manifests
-- =============================================================================

CREATE TABLE platform_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_type manifest_type_enum NOT NULL,
  key VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  change_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, version)
);

-- =============================================================================
-- Table 24: refresh_tokens
-- =============================================================================

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Table 25: audit_logs
-- =============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- updated_at Triggers
-- =============================================================================

CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_carriers_updated_at BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_lines_of_business_updated_at BEFORE UPDATE ON lines_of_business
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_form_papers_updated_at BEFORE UPDATE ON form_papers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_underwriter_capacity_updated_at BEFORE UPDATE ON underwriter_capacity
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_submission_targets_updated_at BEFORE UPDATE ON submission_targets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_emails_updated_at BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_email_import_jobs_updated_at BEFORE UPDATE ON email_import_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attachments_updated_at BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_network_relationships_updated_at BEFORE UPDATE ON network_relationships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sync_schedules_updated_at BEFORE UPDATE ON sync_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sync_jobs_updated_at BEFORE UPDATE ON sync_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_data_freshness_scores_updated_at BEFORE UPDATE ON data_freshness_scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ams_connections_updated_at BEFORE UPDATE ON ams_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_platform_manifests_updated_at BEFORE UPDATE ON platform_manifests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- B-tree Indexes on Foreign Keys
-- =============================================================================

-- teams
CREATE INDEX idx_teams_manager_id ON teams(manager_id);
CREATE INDEX idx_teams_created_by ON teams(created_by);

-- users
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- clients
CREATE INDEX idx_clients_assigned_servicer_id ON clients(assigned_servicer_id);
CREATE INDEX idx_clients_assigned_team_id ON clients(assigned_team_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- carriers
CREATE INDEX idx_carriers_primary_contact_id ON carriers(primary_contact_id);
CREATE INDEX idx_carriers_type ON carriers(type);
CREATE INDEX idx_carriers_is_active ON carriers(is_active);
CREATE INDEX idx_carriers_created_by ON carriers(created_by);

-- contacts
CREATE INDEX idx_contacts_carrier_id ON contacts(carrier_id);
CREATE INDEX idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX idx_contacts_is_active ON contacts(is_active);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);

-- lines_of_business
CREATE INDEX idx_lob_parent_line_id ON lines_of_business(parent_line_id);
CREATE INDEX idx_lob_category ON lines_of_business(category);
CREATE INDEX idx_lob_is_active ON lines_of_business(is_active);

-- form_papers
CREATE INDEX idx_form_papers_carrier_id ON form_papers(carrier_id);
CREATE INDEX idx_form_papers_line_of_business_id ON form_papers(line_of_business_id);
CREATE INDEX idx_form_papers_is_active ON form_papers(is_active);

-- underwriter_capacity
CREATE INDEX idx_capacity_contact_id ON underwriter_capacity(contact_id);
CREATE INDEX idx_capacity_carrier_id ON underwriter_capacity(carrier_id);
CREATE INDEX idx_capacity_line_of_business_id ON underwriter_capacity(line_of_business_id);
CREATE INDEX idx_capacity_form_paper_id ON underwriter_capacity(form_paper_id);
CREATE INDEX idx_capacity_is_active ON underwriter_capacity(is_active);

-- submissions
CREATE INDEX idx_submissions_client_id ON submissions(client_id);
CREATE INDEX idx_submissions_created_by ON submissions(created_by);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_renewal_of ON submissions(renewal_of);
CREATE INDEX idx_submissions_is_active ON submissions(is_active);
CREATE INDEX idx_submissions_effective_date ON submissions(effective_date);
CREATE INDEX idx_submissions_expiration_date ON submissions(expiration_date);

-- submission_targets
CREATE INDEX idx_submission_targets_submission_id ON submission_targets(submission_id);
CREATE INDEX idx_submission_targets_contact_id ON submission_targets(contact_id);
CREATE INDEX idx_submission_targets_carrier_id ON submission_targets(carrier_id);
CREATE INDEX idx_submission_targets_line_of_business_id ON submission_targets(line_of_business_id);
CREATE INDEX idx_submission_targets_status ON submission_targets(status);

-- emails
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_client_id ON emails(client_id);
CREATE INDEX idx_emails_submission_id ON emails(submission_id);
CREATE INDEX idx_emails_contact_id ON emails(contact_id);
CREATE INDEX idx_emails_sent_by_user_id ON emails(sent_by_user_id);
CREATE INDEX idx_emails_import_job_id ON emails(import_job_id);
CREATE INDEX idx_emails_direction ON emails(direction);
CREATE INDEX idx_emails_parse_status ON emails(parse_status);
CREATE INDEX idx_emails_sent_at ON emails(sent_at);

-- email_import_jobs
CREATE INDEX idx_email_import_jobs_user_id ON email_import_jobs(user_id);
CREATE INDEX idx_email_import_jobs_status ON email_import_jobs(status);

-- attachments
CREATE INDEX idx_attachments_client_id ON attachments(client_id);
CREATE INDEX idx_attachments_submission_id ON attachments(submission_id);
CREATE INDEX idx_attachments_email_id ON attachments(email_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_type ON attachments(type);

-- activities
CREATE INDEX idx_activities_entity_type_entity_id ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);

-- templates
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- network_relationships
CREATE INDEX idx_network_relationships_user_id ON network_relationships(user_id);
CREATE INDEX idx_network_relationships_contact_id ON network_relationships(contact_id);
CREATE INDEX idx_network_relationships_introduced_by ON network_relationships(introduced_by);

-- sync_schedules
CREATE INDEX idx_sync_schedules_created_by ON sync_schedules(created_by);
CREATE INDEX idx_sync_schedules_schedule_type ON sync_schedules(schedule_type);
CREATE INDEX idx_sync_schedules_is_active ON sync_schedules(is_active);
CREATE INDEX idx_sync_schedules_next_run_at ON sync_schedules(next_run_at);

-- sync_jobs
CREATE INDEX idx_sync_jobs_schedule_id ON sync_jobs(schedule_id);
CREATE INDEX idx_sync_jobs_triggered_by ON sync_jobs(triggered_by);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_job_type ON sync_jobs(job_type);

-- data_freshness_scores
CREATE INDEX idx_freshness_entity_type_entity_id ON data_freshness_scores(entity_type, entity_id);
CREATE INDEX idx_freshness_status ON data_freshness_scores(freshness_status);
CREATE INDEX idx_freshness_last_verified_by ON data_freshness_scores(last_verified_by);
CREATE INDEX idx_freshness_next_verification_due ON data_freshness_scores(next_verification_due);

-- ams_connections
CREATE INDEX idx_ams_connections_created_by ON ams_connections(created_by);
CREATE INDEX idx_ams_connections_provider ON ams_connections(provider);
CREATE INDEX idx_ams_connections_status ON ams_connections(status);
CREATE INDEX idx_ams_connections_is_active ON ams_connections(is_active);

-- platform_manifests
CREATE INDEX idx_manifests_manifest_type ON platform_manifests(manifest_type);
CREATE INDEX idx_manifests_is_active ON platform_manifests(is_active);
CREATE INDEX idx_manifests_created_by ON platform_manifests(created_by);

-- refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- GIN Indexes on JSONB and Array Columns
-- =============================================================================

-- JSONB columns
CREATE INDEX idx_clients_addresses_gin ON clients USING GIN (addresses);
CREATE INDEX idx_submissions_lines_requested_gin ON submissions USING GIN (lines_requested);
CREATE INDEX idx_submission_targets_quoted_terms_gin ON submission_targets USING GIN (quoted_terms);
CREATE INDEX idx_emails_attachments_gin ON emails USING GIN (attachments);
CREATE INDEX idx_emails_parsed_data_gin ON emails USING GIN (parsed_data);
CREATE INDEX idx_email_import_jobs_import_report_gin ON email_import_jobs USING GIN (import_report);
CREATE INDEX idx_activities_metadata_gin ON activities USING GIN (metadata);
CREATE INDEX idx_sync_schedules_config_gin ON sync_schedules USING GIN (config);
CREATE INDEX idx_sync_schedules_target_scope_gin ON sync_schedules USING GIN (target_scope);
CREATE INDEX idx_sync_schedules_follow_up_config_gin ON sync_schedules USING GIN (follow_up_config);
CREATE INDEX idx_sync_jobs_error_log_gin ON sync_jobs USING GIN (error_log);
CREATE INDEX idx_sync_jobs_summary_gin ON sync_jobs USING GIN (summary);
CREATE INDEX idx_ams_connections_connection_config_gin ON ams_connections USING GIN (connection_config);
CREATE INDEX idx_ams_connections_field_mapping_gin ON ams_connections USING GIN (field_mapping);
CREATE INDEX idx_manifests_config_gin ON platform_manifests USING GIN (config);
CREATE INDEX idx_audit_logs_old_value_gin ON audit_logs USING GIN (old_value);
CREATE INDEX idx_audit_logs_new_value_gin ON audit_logs USING GIN (new_value);

-- Array columns
CREATE INDEX idx_users_specialties_gin ON users USING GIN (specialties);
CREATE INDEX idx_clients_tags_gin ON clients USING GIN (tags);
CREATE INDEX idx_contacts_lines_of_business_gin ON contacts USING GIN (lines_of_business);
CREATE INDEX idx_contacts_tags_gin ON contacts USING GIN (tags);
CREATE INDEX idx_carriers_available_states_gin ON carriers USING GIN (available_states);
CREATE INDEX idx_capacity_appetite_classes_gin ON underwriter_capacity USING GIN (appetite_classes);
CREATE INDEX idx_capacity_appetite_states_gin ON underwriter_capacity USING GIN (appetite_states);
CREATE INDEX idx_emails_to_addresses_gin ON emails USING GIN (to_addresses);
CREATE INDEX idx_emails_cc_addresses_gin ON emails USING GIN (cc_addresses);
CREATE INDEX idx_email_import_jobs_excluded_contacts_gin ON email_import_jobs USING GIN (excluded_contacts);
CREATE INDEX idx_templates_merge_fields_gin ON templates USING GIN (merge_fields);
CREATE INDEX idx_attachments_tags_gin ON attachments USING GIN (tags);
