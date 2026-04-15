-- 016: Add storage_key column to attachments for reliable cloud storage deletion

ALTER TABLE attachments ADD COLUMN IF NOT EXISTS storage_key VARCHAR(1000);

-- Index for storage_key lookups
CREATE INDEX IF NOT EXISTS idx_attachments_storage_key ON attachments(storage_key);
