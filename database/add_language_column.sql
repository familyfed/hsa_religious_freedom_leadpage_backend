-- Add language column to signatures table
-- This migration adds language support for tracking form submission language

-- Add language column with default value
ALTER TABLE signatures ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en';

-- Add index for language queries (useful for analytics)
CREATE INDEX idx_signatures_language ON signatures(language);

-- Update existing records to have 'en' as default language
UPDATE signatures SET language = 'en' WHERE language IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN signatures.language IS 'Language code of the form submission (en, ko, ja, es, zh, fr)';
