-- Add support for polls, quizzes, live locations, and message metadata

-- Add metadata column to messages table for storing poll data, view-once info, etc.
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for querying metadata
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING gin(metadata);

-- Add column for message type to better categorize different message kinds
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Create polls table for better structure (optional, can also use metadata)
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  poll_type TEXT NOT NULL DEFAULT 'poll', -- 'poll' or 'quiz'
  allow_multiple BOOLEAN DEFAULT FALSE,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id)
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE, -- for quiz mode
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, option_id, user_id) -- User can only vote once per option
);

-- Create index for faster vote queries
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Create live locations table for tracking shared locations
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  altitude DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(10, 2),
  address TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER, -- how long to share live location
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id)
);

-- Create index for querying active live locations
CREATE INDEX IF NOT EXISTS idx_live_locations_expires_at ON live_locations(expires_at);
CREATE INDEX IF NOT EXISTS idx_live_locations_user_id ON live_locations(user_id);

-- Add RLS policies for polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view polls in their conversations"
  ON polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = polls.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create polls"
  ON polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = polls.message_id
      AND m.sender_id = auth.uid()
    )
  );

-- Add RLS policies for poll_options
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll options"
  ON poll_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls p
      JOIN messages m ON p.message_id = m.id
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE p.id = poll_options.poll_id
      AND cp.user_id = auth.uid()
    )
  );

-- Add RLS policies for poll_votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
  ON poll_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls p
      JOIN messages m ON p.message_id = m.id
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE p.id = poll_votes.poll_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can vote on polls"
  ON poll_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM polls p
      JOIN messages m ON p.message_id = m.id
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE p.id = poll_votes.poll_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes"
  ON poll_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for live_locations
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view live locations in their conversations"
  ON live_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = live_locations.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own live locations"
  ON live_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live locations"
  ON live_locations FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to clean up expired live locations
CREATE OR REPLACE FUNCTION cleanup_expired_live_locations()
RETURNS void AS $$
BEGIN
  UPDATE live_locations
  SET is_live = FALSE
  WHERE is_live = TRUE
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired timed messages
CREATE OR REPLACE FUNCTION cleanup_expired_timed_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE metadata->>'timedDuration' IS NOT NULL
  AND (metadata->>'expiresAt')::timestamptz < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment to document metadata structure
COMMENT ON COLUMN messages.metadata IS 'JSONB field for storing:
- viewOnce: boolean - if message should disappear after viewing
- viewedBy: array - user IDs who have viewed the message
- timedDuration: number - seconds until message self-destructs
- expiresAt: timestamp - when timed message should be deleted
- edited: boolean - if message was edited
- editedAt: timestamp - when message was last edited
- pollData: object - inline poll data (alternative to polls table)
- reactionData: object - custom reaction data';
