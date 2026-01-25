-- Ensure chat-media bucket is public and policies allow read access

-- Create or update bucket settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  -- Drop/recreate policies for idempotency
  DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own chat media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own chat media" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read chat media" ON storage.objects;

  CREATE POLICY "Authenticated users can upload chat media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  CREATE POLICY "Users can update their own chat media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'chat-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  CREATE POLICY "Users can delete their own chat media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  CREATE POLICY "Public can read chat media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'chat-media');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping storage.objects policies due to insufficient privileges. Run in Supabase SQL editor as owner to apply policies.';
END $$;
