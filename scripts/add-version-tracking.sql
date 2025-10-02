-- Add version column to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0';

-- Create version_history table to track all changes
CREATE TABLE IF NOT EXISTS version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  product_name TEXT NOT NULL,
  dev_end_date DATE NOT NULL,
  qa_end_date DATE NOT NULL,
  release_date DATE NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_note TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_version_history_release_id ON version_history(release_id);
CREATE INDEX IF NOT EXISTS idx_version_history_changed_at ON version_history(changed_at DESC);

-- Enable realtime for version_history table
ALTER PUBLICATION supabase_realtime ADD TABLE version_history;
