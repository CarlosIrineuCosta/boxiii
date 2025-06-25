-- Migration: Update platform column to platforms for consistency
-- This fixes the schema mismatch between expected API field names and database

-- Rename platform column to platforms to match API expectations
ALTER TABLE creators RENAME COLUMN platform TO platforms;

-- Update index name to match new column name
DROP INDEX IF EXISTS idx_creators_platform;
CREATE INDEX idx_creators_platforms ON creators(platforms);

-- Add comment for documentation
COMMENT ON COLUMN creators.platforms IS 'Primary platform where creator is active (e.g., youtube, instagram, tiktok)';