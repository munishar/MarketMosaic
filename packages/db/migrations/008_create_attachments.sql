-- 008: Attachments table

CREATE TABLE IF NOT EXISTS attachments (
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

-- Trigger
DROP TRIGGER IF EXISTS trg_attachments_updated_at ON attachments;
CREATE TRIGGER trg_attachments_updated_at BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- B-tree Indexes
CREATE INDEX IF NOT EXISTS idx_attachments_client_id ON attachments(client_id);
CREATE INDEX IF NOT EXISTS idx_attachments_submission_id ON attachments(submission_id);
CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(type);

-- GIN Indexes
CREATE INDEX IF NOT EXISTS idx_attachments_tags_gin ON attachments USING GIN (tags);
