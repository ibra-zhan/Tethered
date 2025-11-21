// Helper script to check and create missing user profiles
// Run this in your app or use it to debug profile issues

import { supabase } from '../lib/supabase';

export async function checkAndFixUserProfile(userId: string, email: string) {
  console.log('[FixProfile] Checking profile for user:', userId);

  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('[FixProfile] Error fetching profile:', fetchError);
    return { success: false, error: fetchError };
  }

  if (existingProfile) {
    console.log('[FixProfile] Profile exists:', existingProfile);
    return { success: true, profile: existingProfile };
  }

  // Profile doesn't exist, create it
  console.log('[FixProfile] Profile not found, creating one...');

  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      name: email.split('@')[0], // Use email prefix as temporary name
      role: 'student', // Default to student, can be changed
      avatar_url: null,
    })
    .select()
    .single();

  if (createError) {
    console.error('[FixProfile] Error creating profile:', createError);
    return { success: false, error: createError };
  }

  console.log('[FixProfile] Profile created successfully:', newProfile);
  return { success: true, profile: newProfile };
}
