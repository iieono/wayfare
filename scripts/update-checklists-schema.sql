-- Update checklists table to use country_code instead of route
ALTER TABLE checklists 
DROP COLUMN IF EXISTS route,
ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'US';

-- Add foreign key constraint to countries table
ALTER TABLE checklists 
ADD CONSTRAINT fk_checklists_country 
FOREIGN KEY (country_code) REFERENCES countries(code);

-- Update any existing data if needed
-- This is a placeholder - adjust based on your existing data
UPDATE checklists 
SET country_code = 'US' 
WHERE country_code IS NULL OR country_code = '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_checklists_country_user_type 
ON checklists(country_code, user_type, is_template);
