-- 002: Users and Teams tables

CREATE TABLE IF NOT EXISTS teams (
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

CREATE TABLE IF NOT EXISTS users (
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
DO $$ BEGIN
  ALTER TABLE teams ADD CONSTRAINT fk_teams_manager
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Deferred FK: teams.created_by/updated_by -> users
DO $$ BEGIN
  ALTER TABLE teams ADD CONSTRAINT fk_teams_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE teams ADD CONSTRAINT fk_teams_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- users self-referencing created_by/updated_by
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT fk_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT fk_users_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_specialties_gin ON users USING GIN (specialties);
