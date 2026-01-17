-- Create a simple debug version of the function to test if RLS is the issue

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
BEGIN
  -- Simple debug version - just return success without any checks
  RETURN jsonb_build_object(
    'messageRetention', retention_input,
    'success', true,
    'timestamp', extract(epoch from now())
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_room_message_retention(UUID, TEXT) TO authenticated;