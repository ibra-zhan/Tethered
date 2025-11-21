import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Compresses and uploads an image to Supabase Storage
 * @param uri - Local URI of the image
 * @param bucket - Storage bucket name ('posts' or 'avatars')
 * @param userId - User ID for organizing files
 * @param onProgress - Optional callback for upload progress
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
  uri: string,
  bucket: 'posts' | 'avatars',
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${timestamp}.${ext}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Determine content type
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param url - Public URL of the image
 * @param bucket - Storage bucket name
 */
export async function deleteImage(
  url: string,
  bucket: 'posts' | 'avatars'
): Promise<void> {
  try {
    // Extract file path from URL
    const path = url.split(`/${bucket}/`)[1];

    if (!path) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
