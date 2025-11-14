import { supabase } from '../lib/supabase';
import { UserProfile, CreateProfileData, UpdateProfileData, UserType } from '../types';

export const userProfileService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create new user profile
   * Auto-generates family code for students
   */
  async createProfile(userId: string, profileData: CreateProfileData): Promise<UserProfile> {
    const data: any = {
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    };

    // Generate family code for students
    if (profileData.user_type === 'student') {
      data.family_code = await this.generateFamilyCode();
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return profile;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile> {
    const { data, error } = await (supabase
      .from('user_profiles')
      .update as any)({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  /**
   * Check if profile exists
   */
  async hasProfile(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking profile:', error);
      return false;
    }

    return !!data;
  },

  /**
   * Generate unique 6-character family code
   */
  async generateFamilyCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check if code already exists
      const { data } = await supabase
        .from('user_profiles')
        .select('family_code')
        .eq('family_code', code)
        .single();

      isUnique = !data;
    }

    return code;
  },

  /**
   * Find student by family code (for parent pairing)
   */
  async findStudentByFamilyCode(code: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('family_code', code.toUpperCase())
      .eq('user_type', 'student')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error finding student:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get user type
   */
  async getUserType(userId: string): Promise<UserType | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user type:', error);
      return null;
    }

    return (data as any)?.user_type as UserType;
  },
};
