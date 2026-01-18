-- Add user content tables for notes, reminders, saved messages, etc.

-- =====================================================
-- USER NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notes_select_own"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_notes_insert_own"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_notes_update_own"
  ON public.user_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_notes_delete_own"
  ON public.user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER REMINDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_time TIMESTAMPTZ NOT NULL,
  repeat_type TEXT DEFAULT 'none', -- 'none', 'daily', 'weekly', 'monthly'
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_reminders_updated_at
  BEFORE UPDATE ON public.user_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_reminders_select_own"
  ON public.user_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_reminders_insert_own"
  ON public.user_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_reminders_update_own"
  ON public.user_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_reminders_delete_own"
  ON public.user_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER SAVED MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.user_saved_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_saved_messages_select_own"
  ON public.user_saved_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_saved_messages_insert_own"
  ON public.user_saved_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_saved_messages_delete_own"
  ON public.user_saved_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER KEPT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_kept_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.user_kept_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_kept_messages_select_own"
  ON public.user_kept_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_kept_messages_insert_own"
  ON public.user_kept_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_kept_messages_delete_own"
  ON public.user_kept_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_pinned ON public.user_notes(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_user_notes_updated_at ON public.user_notes(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON public.user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_time ON public.user_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_user_reminders_completed ON public.user_reminders(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_user_saved_messages_user_id ON public.user_saved_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_messages_message_id ON public.user_saved_messages(message_id);

CREATE INDEX IF NOT EXISTS idx_user_kept_messages_user_id ON public.user_kept_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kept_messages_message_id ON public.user_kept_messages(message_id);