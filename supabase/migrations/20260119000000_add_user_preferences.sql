-- Add user preferences table for storing app-wide settings
-- This complements the existing chat-specific settings

-- =====================================================
-- USER PREFERENCES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Notification settings
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  desktop_notifications BOOLEAN DEFAULT false,

  -- Privacy settings
  privacy_mode BOOLEAN DEFAULT false,
  show_online_status BOOLEAN DEFAULT true,
  allow_message_previews BOOLEAN DEFAULT true,

  -- Appearance settings
  theme_preference TEXT DEFAULT 'auto', -- 'light', 'dark', 'auto'
  sidebar_position TEXT DEFAULT 'right', -- 'left', 'right'
  message_density TEXT DEFAULT 'comfortable', -- 'compact', 'comfortable', 'spacious'

  -- Behavior settings
  auto_save_notes BOOLEAN DEFAULT true,
  confirm_before_delete BOOLEAN DEFAULT true,
  show_typing_indicators BOOLEAN DEFAULT true,

  -- Performance settings
  message_history_limit INTEGER DEFAULT 1000,
  cache_enabled BOOLEAN DEFAULT true,
  smooth_animations BOOLEAN DEFAULT true,
  auto_load_media BOOLEAN DEFAULT true,
  auto_save_files BOOLEAN DEFAULT false,

  -- Privacy settings
  read_receipts BOOLEAN DEFAULT true,
  ghost_mode BOOLEAN DEFAULT false,
  end_to_end_encryption BOOLEAN DEFAULT true,
  biometric_unlock BOOLEAN DEFAULT false,
  block_strangers BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================
-- Insert default preferences for existing users
INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;