-- 014: Platform Manifests table

CREATE TABLE IF NOT EXISTS platform_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_type manifest_type_enum NOT NULL,
  key VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  change_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, version)
);

-- Trigger
DROP TRIGGER IF EXISTS trg_platform_manifests_updated_at ON platform_manifests;
CREATE TRIGGER trg_platform_manifests_updated_at BEFORE UPDATE ON platform_manifests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_manifests_manifest_type ON platform_manifests(manifest_type);
CREATE INDEX IF NOT EXISTS idx_manifests_is_active ON platform_manifests(is_active);
CREATE INDEX IF NOT EXISTS idx_manifests_created_by ON platform_manifests(created_by);
CREATE INDEX IF NOT EXISTS idx_manifests_config_gin ON platform_manifests USING GIN (config);
