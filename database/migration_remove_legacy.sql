-- Remove legacy platform columns
-- These are no longer needed as we use platforms JSONB array

ALTER TABLE creators DROP COLUMN IF EXISTS platform;
ALTER TABLE creators DROP COLUMN IF EXISTS platform_handle;