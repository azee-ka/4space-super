-- Fix the set_room_message_retention function to bypass RLS since it does its own auth checks

-- Drop the existing function and recreate it without RLS interference
DROP FUNCTION IF EXISTS public.set_room_message_retention(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.set_room_message_retention(
  room_id_input UUID,
  retention_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings JSONB;
  permission TEXT;
BEGIN
  -- Ensure room settings row exists (bypass RLS for this operation)
  SELECT rs.settings
  INTO settings
  FROM public.room_settings rs
  WHERE rs.room_id = room_id_input;

  IF settings IS NULL THEN
    INSERT INTO public.room_settings (room_id, settings)
    VALUES (room_id_input, '{}'::jsonb)
    RETURNING settings INTO settings;
  END IF;

  -- Must be a room member
  IF NOT EXISTS (
    SELECT 1
    FROM public.room_members rm
    WHERE rm.room_id = room_id_input
      AND rm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a room member';
  END IF;

  permission := COALESCE(settings->>'messageRetentionPermission', 'anyone');

  -- If admins-only, ensure space role is owner/admin
  IF permission = 'admins' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.space_members sm
      JOIN public.rooms r ON r.space_id = sm.space_id
      WHERE r.id = room_id_input
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin')
    ) THEN
      RAISE EXCEPTION 'Not allowed to change message retention';
    END IF;
  END IF;

  UPDATE public.room_settings
  SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{messageRetention}',
    to_jsonb(retention_input),
    true
  )
  WHERE room_id = room_id_input
  RETURNING settings INTO settings;

  RETURN settings;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_room_message_retention(UUID, TEXT) TO authenticated;