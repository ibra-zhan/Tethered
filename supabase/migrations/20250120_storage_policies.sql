-- Tethered App - Storage Bucket Policies
-- This file contains RLS policies for Supabase Storage buckets

-- ===========================================
-- AVATARS BUCKET POLICIES
-- ===========================================

-- Policy: Users can view their own avatar
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view family members' avatars
CREATE POLICY "Users can view family avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM public.family_connections
    WHERE (user_id = auth.uid() AND connected_user_id::text = (storage.foldername(name))[1] AND status = 'accepted')
       OR (connected_user_id = auth.uid() AND user_id::text = (storage.foldername(name))[1] AND status = 'accepted')
  )
);

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ===========================================
-- POSTS BUCKET POLICIES
-- ===========================================

-- Policy: Users can view their own post images
CREATE POLICY "Users can view own post images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view family members' post images
CREATE POLICY "Users can view family post images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'posts' AND
  EXISTS (
    SELECT 1 FROM public.family_connections
    WHERE (user_id = auth.uid() AND connected_user_id::text = (storage.foldername(name))[1] AND status = 'accepted')
       OR (connected_user_id = auth.uid() AND user_id::text = (storage.foldername(name))[1] AND status = 'accepted')
  )
);

-- Policy: Users can upload their own post images
CREATE POLICY "Users can upload own post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own post images
CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own post images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ===========================================
-- STORAGE BUCKET CONFIGURATION NOTES
-- ===========================================

/*
To create the storage buckets, run these commands in Supabase SQL Editor or use the Dashboard:

1. CREATE AVATARS BUCKET:
   - Name: avatars
   - Public: false
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

2. CREATE POSTS BUCKET:
   - Name: posts
   - Public: false
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

Organization structure:
- avatars/{user_id}/{filename}
- posts/{user_id}/{filename}
*/
