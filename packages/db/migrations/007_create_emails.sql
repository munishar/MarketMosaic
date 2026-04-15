-- 007: Emails and Email Import Jobs tables

-- emails (without import_job_id FK initially)
CREATE TABLE IF NOT EXISTS emails (
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

CREATE TABLE IF NOT EXISTS email_import_jobs (
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
DO $$ BEGIN
  ALTER TABLE emails ADD CONSTRAINT fk_emails_import_job
    FOREIGN KEY (import_job_id) REFERENCES email_import_jobs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS trg_emails_updated_at ON emails;
CREATE TRIGGER trg_emails_updated_at BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_email_import_jobs_updated_at ON email_import_jobs;
CREATE TRIGGER trg_email_import_jobs_updated_at BEFORE UPDATE ON email_import_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes: emails
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_client_id ON emails(client_id);
CREATE INDEX IF NOT EXISTS idx_emails_submission_id ON emails(submission_id);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_by_user_id ON emails(sent_by_user_id);
CREATE INDEX IF NOT EXISTS idx_emails_import_job_id ON emails(import_job_id);
CREATE INDEX IF NOT EXISTS idx_emails_direction ON emails(direction);
CREATE INDEX IF NOT EXISTS idx_emails_parse_status ON emails(parse_status);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_emails_attachments_gin ON emails USING GIN (attachments);
CREATE INDEX IF NOT EXISTS idx_emails_parsed_data_gin ON emails USING GIN (parsed_data);
CREATE INDEX IF NOT EXISTS idx_emails_to_addresses_gin ON emails USING GIN (to_addresses);
CREATE INDEX IF NOT EXISTS idx_emails_cc_addresses_gin ON emails USING GIN (cc_addresses);

-- Indexes: email_import_jobs
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_user_id ON email_import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_status ON email_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_import_report_gin ON email_import_jobs USING GIN (import_report);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_excluded_contacts_gin ON email_import_jobs USING GIN (excluded_contacts);
