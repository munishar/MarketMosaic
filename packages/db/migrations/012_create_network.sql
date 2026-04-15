-- 012: Network Relationships table

CREATE TABLE IF NOT EXISTS network_relationships (
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

-- Trigger
DROP TRIGGER IF EXISTS trg_network_relationships_updated_at ON network_relationships;
CREATE TRIGGER trg_network_relationships_updated_at BEFORE UPDATE ON network_relationships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_network_relationships_user_id ON network_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_network_relationships_contact_id ON network_relationships(contact_id);
CREATE INDEX IF NOT EXISTS idx_network_relationships_introduced_by ON network_relationships(introduced_by);
