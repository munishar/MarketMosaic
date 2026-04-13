-- 010: Templates table

CREATE TABLE IF NOT EXISTS templates (
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

-- Trigger
DROP TRIGGER IF EXISTS trg_templates_updated_at ON templates;
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- B-tree Indexes
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- GIN Index
CREATE INDEX IF NOT EXISTS idx_templates_merge_fields_gin ON templates USING GIN (merge_fields);
