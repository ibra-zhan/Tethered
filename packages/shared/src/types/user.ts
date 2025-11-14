// User type definitions

export type UserType = 'student' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  user_type: UserType;
  college_name?: string;  // Students only
  family_code?: string;   // Students only
  created_at: string;
  updated_at: string;
}

export interface FamilyConnection {
  id: string;
  student_id: string;
  parent_id: string;
  connected_at: string;
}

export interface Streak {
  family_connection_id: string;
  current_streak: number;
  longest_streak: number;
  last_interaction_date: string;
  updated_at: string;
}

export interface CreateProfileData {
  name: string;
  avatar_url?: string;
  user_type: UserType;
  college_name?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  college_name?: string;
}
