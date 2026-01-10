-- Add missing indexes for foreign keys
-- Fixes the 3 "unindexed_foreign_keys" warnings

CREATE INDEX IF NOT EXISTS idx_calls_initiated_by 
  ON public.calls(initiated_by);

CREATE INDEX IF NOT EXISTS idx_media_files_uploader_id 
  ON public.media_files(uploader_id);

CREATE INDEX IF NOT EXISTS idx_message_threads_parent_message_id 
  ON public.message_threads(parent_message_id);

SELECT '✅ Added missing foreign key indexes' as status;