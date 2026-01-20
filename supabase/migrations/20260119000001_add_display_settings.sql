-- Add display settings table for storing UI appearance preferences
-- This includes background gradients, colors, effects, and UI settings

-- =====================================================
-- DISPLAY SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.display_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Theme
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('system', 'light', 'dark')),

  -- Background type
  background_type TEXT DEFAULT 'solid' CHECK (background_type IN ('radial', 'linear', 'solid', 'none')),

  -- Gradient colors (stored as JSON array)
  gradient_colors JSONB DEFAULT '[{"color": "#000000", "alpha": 0}, {"color": "#000000", "alpha": 0}, {"color": "#000000", "alpha": 0}, {"color": "#000000", "alpha": 0}]',

  -- Radial gradient settings
  radial_position TEXT DEFAULT '50% 0%',
  radial_size_x INTEGER DEFAULT 85 CHECK (radial_size_x >= 30 AND radial_size_x <= 120),
  radial_size_y INTEGER DEFAULT 70 CHECK (radial_size_y >= 30 AND radial_size_y <= 120),

  -- Linear gradient settings
  linear_angle INTEGER DEFAULT 135 CHECK (linear_angle >= 0 AND linear_angle <= 360),

  -- Solid color (default to black)
  solid_color TEXT DEFAULT '#000000',

  -- Image effects
  brightness NUMERIC(3,2) DEFAULT 1.00 CHECK (brightness >= 0.50 AND brightness <= 1.50),
  contrast NUMERIC(3,2) DEFAULT 1.00 CHECK (contrast >= 0.50 AND contrast <= 1.50),
  saturation NUMERIC(3,2) DEFAULT 1.00 CHECK (saturation >= 0.50 AND saturation <= 2.00),
  blur INTEGER DEFAULT 0 CHECK (blur >= 0 AND blur <= 20),

  -- UI settings
  font_size NUMERIC(3,2) DEFAULT 1.00 CHECK (font_size >= 0.80 AND font_size <= 1.50),
  ui_opacity NUMERIC(3,2) DEFAULT 1.00 CHECK (ui_opacity >= 0.50 AND ui_opacity <= 1.00),
  animations BOOLEAN DEFAULT true,
  reduced_motion BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE TRIGGER update_display_settings_updated_at
  BEFORE UPDATE ON public.display_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.display_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "display_settings_select_own"
  ON public.display_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "display_settings_insert_own"
  ON public.display_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "display_settings_update_own"
  ON public.display_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "display_settings_delete_own"
  ON public.display_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_display_settings_user_id ON public.display_settings(user_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================
-- Insert default display settings for existing users
INSERT INTO public.display_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;