-- Add UNIQUE constraint to typing_indicators table for (room_id, user_id)
-- This ensures only one typing indicator per user per room

-- First, remove any duplicate entries
DELETE FROM typing_indicators t1
USING typing_indicators t2
WHERE t1.id > t2.id
  AND t1.room_id = t2.room_id
  AND t1.user_id = t2.user_id;

-- Add the unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'typing_indicators_room_id_user_id_key'
  ) THEN
    ALTER TABLE typing_indicators
    ADD CONSTRAINT typing_indicators_room_id_user_id_key 
    UNIQUE (room_id, user_id);
  END IF;
END $$;
