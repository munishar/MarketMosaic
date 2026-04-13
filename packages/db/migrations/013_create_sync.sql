-- 013: Sync Schedules, Sync Jobs, Data Freshness Scores, AMS Connections

CREATE TABLE IF NOT EXISTS sync_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type sync_schedule_type_enum NOT NULL,
  frequency sync_frequency_enum NOT NULL DEFAULT 'monthly',
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  target_scope JSONB,
  follow_up_config JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES sync_schedules(id) ON DELETE SET NULL,
  job_type sync_job_type_enum NOT NULL,
  status sync_job_status_enum NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  error_log JSONB NOT NULL DEFAULT '[]',
  summary JSONB,
  triggered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_freshness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type data_freshness_entity_type_enum NOT NULL,
  entity_id UUID NOT NULL,
  freshness_status data_freshness_status_enum NOT NULL DEFAULT 'fresh',
  freshness_score INTEGER NOT NULL DEFAULT 100,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_source verification_source_enum NOT NULL DEFAULT 'manual',
  next_verification_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ams_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider ams_provider_enum NOT NULL,
  connection_name VARCHAR(255) NOT NULL,
  status ams_connection_status_enum NOT NULL DEFAULT 'disconnected',
  api_endpoint VARCHAR(500),
  sync_direction sync_direction_enum NOT NULL DEFAULT 'inbound',
  last_sync_at TIMESTAMPTZ,
  connection_config JSONB,
  field_mapping JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
DROP TRIGGER IF EXISTS trg_sync_schedules_updated_at ON sync_schedules;
CREATE TRIGGER trg_sync_schedules_updated_at BEFORE UPDATE ON sync_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sync_jobs_updated_at ON sync_jobs;
CREATE TRIGGER trg_sync_jobs_updated_at BEFORE UPDATE ON sync_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_data_freshness_scores_updated_at ON data_freshness_scores;
CREATE TRIGGER trg_data_freshness_scores_updated_at BEFORE UPDATE ON data_freshness_scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ams_connections_updated_at ON ams_connections;
CREATE TRIGGER trg_ams_connections_updated_at BEFORE UPDATE ON ams_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes: sync_schedules
CREATE INDEX IF NOT EXISTS idx_sync_schedules_created_by ON sync_schedules(created_by);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_schedule_type ON sync_schedules(schedule_type);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_is_active ON sync_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_next_run_at ON sync_schedules(next_run_at);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_config_gin ON sync_schedules USING GIN (config);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_target_scope_gin ON sync_schedules USING GIN (target_scope);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_follow_up_config_gin ON sync_schedules USING GIN (follow_up_config);

-- Indexes: sync_jobs
CREATE INDEX IF NOT EXISTS idx_sync_jobs_schedule_id ON sync_jobs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_triggered_by ON sync_jobs(triggered_by);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_job_type ON sync_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_error_log_gin ON sync_jobs USING GIN (error_log);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_summary_gin ON sync_jobs USING GIN (summary);

-- Indexes: data_freshness_scores
CREATE INDEX IF NOT EXISTS idx_freshness_entity_type_entity_id ON data_freshness_scores(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_freshness_status ON data_freshness_scores(freshness_status);
CREATE INDEX IF NOT EXISTS idx_freshness_last_verified_by ON data_freshness_scores(last_verified_by);
CREATE INDEX IF NOT EXISTS idx_freshness_next_verification_due ON data_freshness_scores(next_verification_due);

-- Indexes: ams_connections
CREATE INDEX IF NOT EXISTS idx_ams_connections_created_by ON ams_connections(created_by);
CREATE INDEX IF NOT EXISTS idx_ams_connections_provider ON ams_connections(provider);
CREATE INDEX IF NOT EXISTS idx_ams_connections_status ON ams_connections(status);
CREATE INDEX IF NOT EXISTS idx_ams_connections_is_active ON ams_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_ams_connections_connection_config_gin ON ams_connections USING GIN (connection_config);
CREATE INDEX IF NOT EXISTS idx_ams_connections_field_mapping_gin ON ams_connections USING GIN (field_mapping);
