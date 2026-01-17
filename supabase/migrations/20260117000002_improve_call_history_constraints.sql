-- Improve Call History Constraints and Indexes
-- Created: 2026-01-17
-- Description: Add constraints and indexes to improve call_history performance and data integrity

-- Add constraints to call_history table
ALTER TABLE call_history
  ADD CONSTRAINT check_call_history_duration_positive CHECK (duration >= 0),
  ADD CONSTRAINT check_call_history_quality_valid CHECK (quality IN ('excellent', 'good', 'fair', 'poor'));

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_history_user_room_started ON call_history(user_id, room_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_session_id ON call_history(session_id);

-- Add a trigger to ensure ended_at is after started_at
CREATE OR REPLACE FUNCTION check_call_history_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at <= NEW.started_at THEN
    RAISE EXCEPTION 'ended_at must be after started_at';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_call_history_timestamps ON call_history;
CREATE TRIGGER trigger_check_call_history_timestamps
  BEFORE INSERT OR UPDATE ON call_history
  FOR EACH ROW
  EXECUTE FUNCTION check_call_history_timestamps();

-- Add comments for documentation
COMMENT ON COLUMN call_history.duration IS 'Call duration in seconds';
COMMENT ON COLUMN call_history.quality IS 'Call quality rating: excellent, good, fair, poor';
COMMENT ON COLUMN call_history.was_host IS 'Whether the user was the call host';