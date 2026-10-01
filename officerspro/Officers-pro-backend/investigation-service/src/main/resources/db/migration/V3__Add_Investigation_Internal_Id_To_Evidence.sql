-- Add investigation_internal_id column to Evidence table
-- This column links evidence to a specific investigation entry by its internal ID
-- This allows evidence to be associated with individual investigation entries rather than shared across all entries

ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS investigation_internal_id INTEGER;

-- Create index for faster lookups by investigation_internal_id
CREATE INDEX IF NOT EXISTS idx_evidence_investigation_internal_id ON Evidence(investigation_internal_id);
