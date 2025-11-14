import { supabase } from '../lib/supabase';
import { Message, CreateCheckInData, CreateReplyData, MessageType } from '../types';

export const messageService = {
  /**
   * Send daily check-in
   */
  async sendCheckIn(data: CreateCheckInData): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        family_connection_id: data.family_connection_id,
        sender_id: data.sender_id,
        message_type: 'checkin' as MessageType,
        emoji: data.emoji,
        message_text: data.message_text,
        photo_url: data.photo_url,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error sending check-in:', error);
      throw error;
    }

    // Update streak
    await this.updateStreak(data.family_connection_id);

    return message;
  },

  /**
   * Reply to a message
   */
  async sendReply(data: CreateReplyData): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        family_connection_id: data.family_connection_id,
        sender_id: data.sender_id,
        message_type: 'reply' as MessageType,
        emoji: data.emoji,
        message_text: data.message_text,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error sending reply:', error);
      throw error;
    }

    // Update streak
    await this.updateStreak(data.family_connection_id);

    return message;
  },

  /**
   * Get all messages for a family connection
   */
  async getMessages(familyConnectionId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('family_connection_id', familyConnectionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get paginated messages (for infinite scroll)
   */
  async getMessagesPaginated(
    familyConnectionId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('family_connection_id', familyConnectionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching paginated messages:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get latest message
   */
  async getLatestMessage(familyConnectionId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('family_connection_id', familyConnectionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No messages yet
      }
      console.error('Error fetching latest message:', error);
      throw error;
    }

    return data;
  },

  /**
   * Subscribe to new messages (realtime)
   */
  subscribeToMessages(
    familyConnectionId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${familyConnectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `family_connection_id=eq.${familyConnectionId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },

  /**
   * Update streak after interaction
   * Simplified version for MVP
   */
  async updateStreak(familyConnectionId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('family_connection_id', familyConnectionId)
      .single();

    if (!streak) return;

    const lastDate = (streak as any).last_interaction_date;
    let newStreak = (streak as any).current_streak;

    if (!lastDate) {
      // First interaction
      newStreak = 1;
    } else {
      const daysDiff = this.daysBetween(new Date(lastDate), new Date(today));
      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, don't change streak
    }

    await (supabase
      .from('streaks')
      .update as any)({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, (streak as any).longest_streak),
        last_interaction_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('family_connection_id', familyConnectionId);
  },

  /**
   * Helper: Calculate days between dates
   */
  daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / oneDay);
  },
};
