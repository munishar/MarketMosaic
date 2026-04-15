-- 001: Extensions, Enum Types, and Utility Functions
-- Idempotent: uses IF NOT EXISTS and DO $$ blocks

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Utility function for auto-updating updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Enum Types
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'servicer', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_type_enum AS ENUM ('underwriter', 'wholesaler', 'mga', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE carrier_type_enum AS ENUM ('admitted', 'non_admitted', 'surplus');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lob_category_enum AS ENUM ('casualty', 'property', 'specialty', 'financial_lines');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE form_paper_type_enum AS ENUM ('occurrence', 'claims_made', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_status_enum AS ENUM ('prospect', 'active', 'inactive', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted', 'quoted', 'bound', 'declined', 'expired', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_target_status_enum AS ENUM ('pending', 'submitted', 'reviewing', 'quoted', 'declined', 'bound', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_direction_enum AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_source_enum AS ENUM ('platform', 'import_gmail', 'import_outlook');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_parse_status_enum AS ENUM ('unparsed', 'parsed', 'review_needed', 'confirmed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_import_status_enum AS ENUM ('connecting', 'scanning', 'previewing', 'importing', 'enriching', 'complete', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enrichment_status_enum AS ENUM ('pending', 'in_progress', 'complete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE attachment_type_enum AS ENUM ('application', 'loss_run', 'acord_form', 'quote', 'binder', 'policy', 'endorsement', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_type_enum AS ENUM ('email_sent', 'email_received', 'submission_created', 'quote_received', 'bound', 'declined', 'note_added', 'contact_created', 'document_uploaded', 'renewal_alert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_type_enum AS ENUM ('client', 'contact', 'submission', 'email', 'carrier', 'line_of_business', 'form_paper', 'capacity', 'user', 'team');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM ('renewal_upcoming', 'quote_received', 'submission_declined', 'network_request', 'system_alert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE relationship_strength_enum AS ENUM ('strong', 'moderate', 'weak', 'new_contact');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE preferred_contact_method_enum AS ENUM ('email', 'phone', 'both');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE template_type_enum AS ENUM ('email', 'document', 'cover_letter', 'acord');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_schedule_type_enum AS ENUM ('capacity_inquiry', 'ams_sync', 'external_enrichment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_frequency_enum AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_job_type_enum AS ENUM ('capacity_inquiry', 'ams_sync', 'external_enrichment', 'manual_refresh');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_job_status_enum AS ENUM ('queued', 'running', 'complete', 'partial', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_freshness_status_enum AS ENUM ('fresh', 'aging', 'stale', 'refresh_pending', 'refresh_failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_freshness_entity_type_enum AS ENUM ('underwriter_capacity', 'contact', 'carrier', 'client', 'form_paper');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_source_enum AS ENUM ('manual', 'ams_sync', 'capacity_inquiry_response', 'external_enrichment', 'email_import');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ams_provider_enum AS ENUM ('applied_epic', 'ams360', 'hawksoft', 'vertafore', 'csv_import', 'custom_api');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ams_connection_status_enum AS ENUM ('connected', 'disconnected', 'error', 'testing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_direction_enum AS ENUM ('inbound', 'outbound', 'bidirectional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE manifest_type_enum AS ENUM ('entity_definition', 'field_schema', 'workflow_definition', 'ui_layout', 'permission_matrix', 'navigation', 'business_rule', 'validation_rule');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
