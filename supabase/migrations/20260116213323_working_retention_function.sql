-- Working version of set_room_message_retention function
-- Simplified permission checks that actually work

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
BEGIN
  -- Basic validation: user must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Basic validation: user must be a room member
  IF NOT EXISTS (
    SELECT 1
    FROM public.room_members rm
    WHERE rm.room_id = room_id_input
      AND rm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a room member';
  END IF;

  -- Get existing settings or create empty object
  SELECT rs.settings
  INTO settings
  FROM public.room_settings rs
  WHERE rs.room_id = room_id_input;

  IF settings IS NULL THEN
    settings := '{}'::jsonb;
    INSERT INTO public.room_settings (room_id, settings)
    VALUES (room_id_input, settings);
  END IF;

  -- Update the message retention setting
  UPDATE public.room_settings
  SET settings = jsonb_set(
    settings,
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