-- 003: Clients table

CREATE TABLE IF NOT EXISTS clients (
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

-- Trigger
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- B-tree Indexes
CREATE INDEX IF NOT EXISTS idx_clients_assigned_servicer_id ON clients(assigned_servicer_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_team_id ON clients(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);

-- GIN Indexes
CREATE INDEX IF NOT EXISTS idx_clients_addresses_gin ON clients USING GIN (addresses);
CREATE INDEX IF NOT EXISTS idx_clients_tags_gin ON clients USING GIN (tags);
