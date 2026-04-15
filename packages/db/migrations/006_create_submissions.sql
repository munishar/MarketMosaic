-- 006: Submissions and Submission Targets tables

CREATE TABLE IF NOT EXISTS submissions (
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

CREATE TABLE IF NOT EXISTS submission_targets (
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

-- Triggers
DROP TRIGGER IF EXISTS trg_submissions_updated_at ON submissions;
CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_submission_targets_updated_at ON submission_targets;
CREATE TRIGGER trg_submission_targets_updated_at BEFORE UPDATE ON submission_targets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes: submissions
CREATE INDEX IF NOT EXISTS idx_submissions_client_id ON submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_by ON submissions(created_by);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_renewal_of ON submissions(renewal_of);
CREATE INDEX IF NOT EXISTS idx_submissions_is_active ON submissions(is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_effective_date ON submissions(effective_date);
CREATE INDEX IF NOT EXISTS idx_submissions_expiration_date ON submissions(expiration_date);
CREATE INDEX IF NOT EXISTS idx_submissions_lines_requested_gin ON submissions USING GIN (lines_requested);

-- Indexes: submission_targets
CREATE INDEX IF NOT EXISTS idx_submission_targets_submission_id ON submission_targets(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_contact_id ON submission_targets(contact_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_carrier_id ON submission_targets(carrier_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_line_of_business_id ON submission_targets(line_of_business_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_status ON submission_targets(status);
CREATE INDEX IF NOT EXISTS idx_submission_targets_quoted_terms_gin ON submission_targets USING GIN (quoted_terms);
