-- FIXED MIGRATION - Correct Order!
-- Create tables first, THEN add foreign key columns

-- =====================================================
-- PART 1: CREATE NEW TABLES FIRST (No dependencies)
-- =====================================================

-- Rooms table (create first - no dependencies)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  category TEXT,
  icon TEXT,
  color TEXT,
  is_private BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  parent_room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Room members
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  notification_preference TEXT DEFAULT 'all',
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- PART 2: UPDATE EXISTING MESSAGES TABLE
-- =====================================================

-- Now we can safely add columns with foreign keys since rooms exists
DO $$ 
BEGIN
  -- Add room_id (NOW it's safe because rooms table exists!)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='room_id') THEN
    ALTER TABLE messages ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;
  END IF;

  -- Add message_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='message_type') THEN
    ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text';
  END IF;

  -- Add reply_to_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='reply_to_id') THEN
    ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
  END IF;

  -- Add thread_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='thread_id') THEN
    ALTER TABLE messages ADD COLUMN thread_id UUID REFERENCES messages(id) ON DELETE CASCADE;
  END IF;

  -- Add forward_from_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='forward_from_id') THEN
    ALTER TABLE messages ADD COLUMN forward_from_id UUID REFERENCES messages(id) ON DELETE SET NULL;
  END IF;

  -- Add edited_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='edited_at') THEN
    ALTER TABLE messages ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;

  -- Add deleted_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='deleted_at') THEN
    ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;

  -- Add is_pinned
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='is_pinned') THEN
    ALTER TABLE messages ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;

  -- Add is_system
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='is_system') THEN
    ALTER TABLE messages ADD COLUMN is_system BOOLEAN DEFAULT false;
  END IF;

  -- Add ttl
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='ttl') THEN
    ALTER TABLE messages ADD COLUMN ttl INTEGER;
  END IF;

  -- Add expires_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='expires_at') THEN
    ALTER TABLE messages ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;

  -- Add attachments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='attachments') THEN
    ALTER TABLE messages ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add ai_context
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='ai_context') THEN
    ALTER TABLE messages ADD COLUMN ai_context JSONB;
  END IF;

  -- Add metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='metadata') THEN
    ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add content (for search)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='content') THEN
    ALTER TABLE messages ADD COLUMN content TEXT;
  END IF;

  -- Add updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='updated_at') THEN
    ALTER TABLE messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- PART 3: CREATE REMAINING TABLES (depend on messages)
-- =====================================================

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Update existing typing_indicators table if it exists with old schema
DO $$ 
BEGIN
  -- Add room_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='typing_indicators' AND column_name='room_id') THEN
    -- If the table exists but doesn't have room_id, add it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='typing_indicators') THEN
      ALTER TABLE typing_indicators ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Add started_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='typing_indicators' AND column_name='started_at') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='typing_indicators') THEN
      ALTER TABLE typing_indicators ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Polls
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL UNIQUE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  allows_multiple BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled messages
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message labels
CREATE TABLE IF NOT EXISTS message_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, name)
);

-- Message label assignments
CREATE TABLE IF NOT EXISTS message_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES message_labels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, label_id)
);

-- =====================================================
-- PART 4: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_space_id ON messages(space_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_started_at ON typing_indicators(started_at);

-- =====================================================
-- PART 5: ENABLE RLS
-- =====================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_label_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view accessible rooms" ON rooms;
DROP POLICY IF EXISTS "Space members can create rooms" ON rooms;
DROP POLICY IF EXISTS "Room admins can update rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view room members" ON room_members;
DROP POLICY IF EXISTS "Users can view room messages" ON messages;
DROP POLICY IF EXISTS "Room members can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON message_reactions;
DROP POLICY IF EXISTS "Users can view read receipts" ON message_read_receipts;
DROP POLICY IF EXISTS "Users can mark messages as read" ON message_read_receipts;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON message_bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON message_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON message_bookmarks;
DROP POLICY IF EXISTS "Users can view typing indicators" ON typing_indicators;
DROP POLICY IF EXISTS "Users can update own typing status" ON typing_indicators;
DROP POLICY IF EXISTS "Space members can view labels" ON message_labels;
DROP POLICY IF EXISTS "Space admins can manage labels" ON message_labels;

-- Rooms policies
CREATE POLICY "Users can view accessible rooms" ON rooms
  FOR SELECT USING (
    id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
    OR (is_private = false AND space_id IN (
      SELECT space_id FROM space_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Space members can create rooms" ON rooms
  FOR INSERT WITH CHECK (
    space_id IN (
      SELECT space_id FROM space_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Room admins can update rooms" ON rooms
  FOR UPDATE USING (
    id IN (
      SELECT room_id FROM room_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Room members policies
CREATE POLICY "Users can view room members" ON room_members
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );

-- Messages policies  
CREATE POLICY "Users can view room messages" ON messages
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Room members can send messages" ON messages
  FOR INSERT WITH CHECK (
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- Reactions
CREATE POLICY "Users can view reactions" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM messages WHERE room_id IN (
        SELECT room_id FROM room_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Read receipts
CREATE POLICY "Users can view read receipts" ON message_read_receipts
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM messages WHERE room_id IN (
        SELECT room_id FROM room_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can mark messages as read" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Bookmarks
CREATE POLICY "Users can view own bookmarks" ON message_bookmarks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks" ON message_bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks" ON message_bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- Typing
CREATE POLICY "Users can view typing indicators" ON typing_indicators
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own typing status" ON typing_indicators
  FOR ALL USING (user_id = auth.uid());

-- Labels
CREATE POLICY "Space members can view labels" ON message_labels
  FOR SELECT USING (
    space_id IN (SELECT space_id FROM space_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Space admins can manage labels" ON message_labels
  FOR ALL USING (
    space_id IN (
      SELECT space_id FROM space_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- PART 7: FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_room_last_message ON messages;
CREATE TRIGGER trigger_update_room_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_last_message();

CREATE OR REPLACE FUNCTION clean_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 8: CREATE DEFAULT ROOMS FOR EXISTING SPACES
-- =====================================================

INSERT INTO rooms (space_id, name, description, type, created_by)
SELECT 
  s.id,
  'general',
  'General discussion',
  'text',
  s.owner_id
FROM spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM rooms WHERE space_id = s.id AND name = 'general'
);

INSERT INTO room_members (room_id, user_id, role)
SELECT r.id, s.owner_id, 'admin'
FROM rooms r
JOIN spaces s ON r.space_id = s.id
WHERE r.name = 'general'
AND NOT EXISTS (
  SELECT 1 FROM room_members WHERE room_id = r.id AND user_id = s.owner_id
);

-- =====================================================
-- PART 9: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON rooms TO authenticated;
GRANT ALL ON room_members TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON message_reactions TO authenticated;
GRANT ALL ON message_read_receipts TO authenticated;
GRANT ALL ON message_bookmarks TO authenticated;
GRANT ALL ON typing_indicators TO authenticated;
GRANT ALL ON polls TO authenticated;
GRANT ALL ON ai_conversations TO authenticated;
GRANT ALL ON scheduled_messages TO authenticated;
GRANT ALL ON message_labels TO authenticated;
GRANT ALL ON message_label_assignments TO authenticated;

SELECT 'Chat system migration completed successfully! ✅' as status;