-- Enable realtime for call_sessions table
-- Allows real-time updates for active call sessions across all room participants

ALTER PUBLICATION supabase_realtime ADD TABLE call_sessions;

-- Also enable realtime for call_history table
ALTER PUBLICATION supabase_realtime ADD TABLE call_history;