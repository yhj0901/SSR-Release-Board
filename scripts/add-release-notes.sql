-- Add release_notes column to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS release_notes TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN releases.release_notes IS 'Release notes describing what is included in this version';
