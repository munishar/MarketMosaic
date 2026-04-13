-- 009: Activities table (no updated_at - append-only)

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type_enum NOT NULL,
  entity_type entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No trigger needed - activities is append-only (no updated_at column)

-- B-tree Indexes
CREATE INDEX IF NOT EXISTS idx_activities_entity_type_entity_id ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);

-- GIN Index
CREATE INDEX IF NOT EXISTS idx_activities_metadata_gin ON activities USING GIN (metadata);
