-- 005: Underwriter Capacity table

CREATE TABLE IF NOT EXISTS underwriter_capacity (
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

-- Trigger
DROP TRIGGER IF EXISTS trg_underwriter_capacity_updated_at ON underwriter_capacity;
CREATE TRIGGER trg_underwriter_capacity_updated_at BEFORE UPDATE ON underwriter_capacity
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- B-tree Indexes
CREATE INDEX IF NOT EXISTS idx_capacity_contact_id ON underwriter_capacity(contact_id);
CREATE INDEX IF NOT EXISTS idx_capacity_carrier_id ON underwriter_capacity(carrier_id);
CREATE INDEX IF NOT EXISTS idx_capacity_line_of_business_id ON underwriter_capacity(line_of_business_id);
CREATE INDEX IF NOT EXISTS idx_capacity_form_paper_id ON underwriter_capacity(form_paper_id);
CREATE INDEX IF NOT EXISTS idx_capacity_is_active ON underwriter_capacity(is_active);

-- GIN Indexes
CREATE INDEX IF NOT EXISTS idx_capacity_appetite_classes_gin ON underwriter_capacity USING GIN (appetite_classes);
CREATE INDEX IF NOT EXISTS idx_capacity_appetite_states_gin ON underwriter_capacity USING GIN (appetite_states);
