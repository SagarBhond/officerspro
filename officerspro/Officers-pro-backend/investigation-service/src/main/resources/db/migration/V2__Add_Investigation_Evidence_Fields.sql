-- Add new fields to Investigation table
ALTER TABLE Investigation 
ADD COLUMN description TEXT AFTER status,
ADD COLUMN arrest_status VARCHAR(50) AFTER description;

-- Add new fields to Evidence table
ALTER TABLE Evidence
ADD COLUMN location_found VARCHAR(255) AFTER evidence_type,
ADD COLUMN collected_by VARCHAR(255) AFTER location_found,
ADD COLUMN collected_on DATETIME AFTER collected_by;

-- Update existing records with default values if needed
UPDATE Investigation SET description = '' WHERE description IS NULL;
UPDATE Investigation SET arrest_status = 'Pending' WHERE arrest_status IS NULL;
