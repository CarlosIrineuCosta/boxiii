-- Migration to fix platform schema mismatch
-- Remove NOT NULL constraints and add platforms JSONB field

-- Add new platforms field for array support
ALTER TABLE creators ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '[]';

-- Make legacy platform fields nullable for backward compatibility
ALTER TABLE creators ALTER COLUMN platform DROP NOT NULL;
ALTER TABLE creators ALTER COLUMN platform_handle DROP NOT NULL;

-- Set default values for existing records
UPDATE creators SET platform = 'website' WHERE platform IS NULL;
UPDATE creators SET platform_handle = '' WHERE platform_handle IS NULL;