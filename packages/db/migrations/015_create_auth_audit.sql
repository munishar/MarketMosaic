-- 015: Refresh Tokens and Audit Logs tables

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for refresh_tokens
DROP TRIGGER IF EXISTS trg_refresh_tokens_updated_at ON refresh_tokens;
CREATE TRIGGER trg_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- No trigger for audit_logs - append-only (no updated_at column)

-- Indexes: refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Indexes: audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- GIN Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_value_gin ON audit_logs USING GIN (old_value);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_value_gin ON audit_logs USING GIN (new_value);
