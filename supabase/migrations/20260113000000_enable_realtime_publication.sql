-- Enable Realtime for messages and related tables
-- Supabase requires tables to be explicitly added to the supabase_realtime publication

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for rooms table (for room updates)
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Enable realtime for room_members table (for member updates)
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;

-- Enable realtime for message_reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- Enable realtime for message_read_receipts table
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;

-- Enable realtime for typing_indicators table
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
