-- Add is_kept column for message keeping functionality

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_kept BOOLEAN DEFAULT FALSE;