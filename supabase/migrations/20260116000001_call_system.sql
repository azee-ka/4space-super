-- Call System Tables Migration
-- Created: 2026-01-16
-- Description: Tables for call history, sessions, and related features

-- Call Sessions Table
CREATE TABLE IF NOT EXISTS call_sessions (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  guidelines JSONB DEFAULT '[]'::jsonb,
  type TEXT NOT NULL CHECK (type IN ('voice', 'video', 'screen-share')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  participant_count INTEGER NOT NULL DEFAULT 1,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_recording BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_participants INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call History Table
CREATE TABLE IF NOT EXISTS call_history (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('voice', 'video', 'screen-share')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  was_host BOOLEAN NOT NULL DEFAULT false,
  quality TEXT CHECK (quality IN ('excellent', 'good', 'fair', 'poor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Screen Share Sessions Table
CREATE TABLE IF NOT EXISTS screen_share_sessions (
  id TEXT PRIMARY KEY,
  call_session_id TEXT REFERENCES call_sessions(id) ON DELETE CASCADE,
  presenter_id TEXT NOT NULL,
  presenter_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  viewer_ids JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call Messages Table (In-call chat)
CREATE TABLE IF NOT EXISTS call_messages (
  id TEXT PRIMARY KEY,
  call_session_id TEXT REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'system', 'reaction')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call Reactions Table
CREATE TABLE IF NOT EXISTS call_reactions (
  id TEXT PRIMARY KEY,
  call_session_id TEXT REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_sessions_room_id ON call_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_is_active ON call_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_call_sessions_started_at ON call_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_user_id ON call_history(user_id);
CREATE INDEX IF NOT EXISTS idx_call_history_room_id ON call_history(room_id);
CREATE INDEX IF NOT EXISTS idx_call_history_started_at ON call_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_screen_share_session_id ON screen_share_sessions(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_messages_session_id ON call_messages(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_reactions_session_id ON call_reactions(call_session_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for call_sessions updated_at
DROP TRIGGER IF EXISTS update_call_sessions_updated_at ON call_sessions;
CREATE TRIGGER update_call_sessions_updated_at
  BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_share_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for call_sessions (everyone in room can see active sessions)
CREATE POLICY "Allow read access to active call sessions"
  ON call_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow insert for authenticated users"
  ON call_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for session host"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);

-- Policies for call_history (users can see their own history)
CREATE POLICY "Allow users to read their own call history"
  ON call_history FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Allow users to insert their own call history"
  ON call_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Policies for screen_share_sessions
CREATE POLICY "Allow read access to screen share sessions"
  ON screen_share_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow insert for presenters"
  ON screen_share_sessions FOR INSERT
  WITH CHECK (presenter_id = auth.uid()::text);

CREATE POLICY "Allow update for presenters"
  ON screen_share_sessions FOR UPDATE
  USING (presenter_id = auth.uid()::text);

-- Policies for call_messages
-- Policies for call_messages
CREATE POLICY "Allow read access to call messages"
  ON call_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON call_messages FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Policies for call_reactions
CREATE POLICY "Allow read access to reactions"
  ON call_reactions FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON call_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Comments for documentation
COMMENT ON TABLE call_sessions IS 'Stores active and historical call sessions with metadata';
COMMENT ON TABLE call_history IS 'Individual user call history log';
COMMENT ON TABLE screen_share_sessions IS 'Screen sharing sessions within calls';
COMMENT ON TABLE call_messages IS 'In-call chat messages';
COMMENT ON TABLE call_reactions IS 'In-call reactions/emojis';
