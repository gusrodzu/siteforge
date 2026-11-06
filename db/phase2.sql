-- Idempotent migration for existing MVP databases.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS theme JSONB NOT NULL DEFAULT '{}'::jsonb;
