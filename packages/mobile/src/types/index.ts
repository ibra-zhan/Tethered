export type UserRole = 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type Mood = 'happy' | 'anxious' | 'tired' | 'excited' | 'sad' | 'strong';

export const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'excited', emoji: '🎉', label: 'Excited' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'strong', emoji: '💪', label: 'Strong' },
];

export interface Post {
  id: string;
  userId: string;
  type: 'check-in' | 'prompt-answer';
  imageUrl: string;
  mood?: Mood;
  text?: string;
  timestamp: number;
  promptId?: string;
}

export interface Prompt {
  id: string;
  text: string;
  date: string; // ISO Date
}

export interface FlameState {
  streakDays: number;
  level: 1 | 2 | 3; // 1=Starting (1-9 days), 2=Steady (10-29 days), 3=Eternal (30+ days)
}
