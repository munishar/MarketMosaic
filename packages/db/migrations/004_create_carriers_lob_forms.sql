-- 004: Carriers, Contacts, Lines of Business, and Form Papers

-- carriers (without primary_contact_id FK initially)
CREATE TABLE IF NOT EXISTS carriers (
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

-- contacts
CREATE TABLE IF NOT EXISTS contacts (
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
DO $$ BEGIN
  ALTER TABLE carriers ADD CONSTRAINT fk_carriers_primary_contact
    FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- lines_of_business
CREATE TABLE IF NOT EXISTS lines_of_business (
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

-- form_papers
CREATE TABLE IF NOT EXISTS form_papers (
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

-- Triggers
DROP TRIGGER IF EXISTS trg_carriers_updated_at ON carriers;
CREATE TRIGGER trg_carriers_updated_at BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_contacts_updated_at ON contacts;
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lines_of_business_updated_at ON lines_of_business;
CREATE TRIGGER trg_lines_of_business_updated_at BEFORE UPDATE ON lines_of_business
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_form_papers_updated_at ON form_papers;
CREATE TRIGGER trg_form_papers_updated_at BEFORE UPDATE ON form_papers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes: carriers
CREATE INDEX IF NOT EXISTS idx_carriers_primary_contact_id ON carriers(primary_contact_id);
CREATE INDEX IF NOT EXISTS idx_carriers_type ON carriers(type);
CREATE INDEX IF NOT EXISTS idx_carriers_is_active ON carriers(is_active);
CREATE INDEX IF NOT EXISTS idx_carriers_created_by ON carriers(created_by);
CREATE INDEX IF NOT EXISTS idx_carriers_available_states_gin ON carriers USING GIN (available_states);

-- Indexes: contacts
CREATE INDEX IF NOT EXISTS idx_contacts_carrier_id ON contacts(carrier_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_lines_of_business_gin ON contacts USING GIN (lines_of_business);
CREATE INDEX IF NOT EXISTS idx_contacts_tags_gin ON contacts USING GIN (tags);

-- Indexes: lines_of_business
CREATE INDEX IF NOT EXISTS idx_lob_parent_line_id ON lines_of_business(parent_line_id);
CREATE INDEX IF NOT EXISTS idx_lob_category ON lines_of_business(category);
CREATE INDEX IF NOT EXISTS idx_lob_is_active ON lines_of_business(is_active);

-- Indexes: form_papers
CREATE INDEX IF NOT EXISTS idx_form_papers_carrier_id ON form_papers(carrier_id);
CREATE INDEX IF NOT EXISTS idx_form_papers_line_of_business_id ON form_papers(line_of_business_id);
CREATE INDEX IF NOT EXISTS idx_form_papers_is_active ON form_papers(is_active);
