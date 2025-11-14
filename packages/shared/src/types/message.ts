// Message type definitions

export type MessageType = 'checkin' | 'prompt_response' | 'reply';

export interface Message {
  id: string;
  family_connection_id: string;
  sender_id: string;
  message_type: MessageType;
  prompt_id?: number;
  emoji?: string;
  message_text: string;
  photo_url?: string;
  created_at: string;
}

export interface CreateCheckInData {
  family_connection_id: string;
  sender_id: string;
  emoji?: string;
  message_text: string;
  photo_url?: string;
}

export interface CreatePromptResponseData {
  family_connection_id: string;
  sender_id: string;
  prompt_id: number;
  message_text: string;
  photo_url?: string;
}

export interface CreateReplyData {
  family_connection_id: string;
  sender_id: string;
  emoji?: string;
  message_text: string;
}

export interface Prompt {
  id: number;
  category: 'adulting' | 'mental_health' | 'financial' | 'life_advice' | 'nostalgia' | 'personal_growth';
  question_text: string;
  target_audience: 'student' | 'parent' | 'either';
}
