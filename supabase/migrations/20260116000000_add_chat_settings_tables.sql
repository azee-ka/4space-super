-- Add chat settings tables for user, room, and space preferences

-- =====================================================
-- USER CHAT SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_chat_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_chat_settings_updated_at
  BEFORE UPDATE ON public.user_chat_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.user_chat_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_chat_settings_select_own"
  ON public.user_chat_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_chat_settings_insert_own"
  ON public.user_chat_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_chat_settings_update_own"
  ON public.user_chat_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed existing profiles with default settings rows
INSERT INTO public.user_chat_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT DO NOTHING;

-- =====================================================
-- SPACE SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.space_settings (
  space_id UUID PRIMARY KEY REFERENCES public.spaces(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_space_settings_updated_at
  BEFORE UPDATE ON public.space_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.space_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "space_settings_select_members"
  ON public.space_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_settings.space_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "space_settings_insert_admin"
  ON public.space_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_settings.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "space_settings_update_admin"
  ON public.space_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_settings.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
  );

INSERT INTO public.space_settings (space_id)
SELECT id FROM public.spaces
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROOM SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.room_settings (
  room_id UUID PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_room_settings_updated_at
  BEFORE UPDATE ON public.room_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_settings_select_members"
  ON public.room_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_settings.room_id
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "room_settings_insert_member"
  ON public.room_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_settings.room_id
      AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "room_settings_update_admin"
  ON public.room_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.space_members sm ON sm.space_id = r.space_id
      WHERE r.id = room_settings.room_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_settings.room_id
      AND r.created_by = auth.uid()
    )
  );

INSERT INTO public.room_settings (room_id)
SELECT id FROM public.rooms
ON CONFLICT DO NOTHING;
