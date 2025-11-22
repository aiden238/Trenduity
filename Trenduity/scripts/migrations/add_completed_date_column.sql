-- Migration: Add completed_date column to completed_cards table
-- Date: 2025-11-21
-- Purpose: Fix duplicate card completion prevention logic

-- Step 1: Add completed_date column with default value
ALTER TABLE completed_cards 
ADD COLUMN IF NOT EXISTS completed_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Step 2: Populate completed_date from existing completed_at timestamps
UPDATE completed_cards 
SET completed_date = DATE(completed_at) 
WHERE completed_date = CURRENT_DATE;

-- Step 3: Drop old UNIQUE constraints (if exists)
ALTER TABLE completed_cards 
DROP CONSTRAINT IF EXISTS completed_cards_user_id_card_id_date_key;

ALTER TABLE completed_cards 
DROP CONSTRAINT IF EXISTS completed_cards_user_id_card_id_completed_date_unique;

-- Step 4: Add new UNIQUE constraint with completed_date
ALTER TABLE completed_cards 
ADD CONSTRAINT completed_cards_user_id_card_id_completed_date_unique 
UNIQUE (user_id, card_id, completed_date);

-- Step 5: Add index for performance
CREATE INDEX IF NOT EXISTS idx_completed_cards_date 
ON completed_cards(user_id, completed_date);

-- Verification query (run this after migration)
-- SELECT user_id, card_id, completed_at, completed_date FROM completed_cards ORDER BY completed_at DESC LIMIT 10;
