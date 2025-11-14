import { supabase } from '../lib/supabase';
import { FamilyConnection, UserProfile } from '../types';

export const familyConnectionService = {
  /**
   * Create connection between student and parent
   */
  async createConnection(studentId: string, parentId: string): Promise<FamilyConnection> {
    const { data, error } = await supabase
      .from('family_connections')
      .insert({
        student_id: studentId,
        parent_id: parentId,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating connection:', error);
      throw error;
    }

    // Initialize streak for this connection
    await supabase.from('streaks').insert({
      family_connection_id: (data as any).id,
      current_streak: 0,
      longest_streak: 0,
      last_interaction_date: null,
    } as any);

    return data;
  },

  /**
   * Get family connection for a user
   */
  async getConnection(userId: string): Promise<FamilyConnection | null> {
    const { data, error } = await supabase
      .from('family_connections')
      .select('*')
      .or(`student_id.eq.${userId},parent_id.eq.${userId}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching connection:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get the other person in the connection
   */
  async getConnectionPartner(userId: string): Promise<UserProfile | null> {
    const connection = await this.getConnection(userId);
    if (!connection) return null;

    const partnerId =
      connection.student_id === userId ? connection.parent_id : connection.student_id;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (error) {
      console.error('Error fetching partner:', error);
      throw error;
    }

    return data;
  },

  /**
   * Check if user has a connection
   */
  async hasConnection(userId: string): Promise<boolean> {
    const connection = await this.getConnection(userId);
    return !!connection;
  },

  /**
   * Get connection ID for a user
   */
  async getConnectionId(userId: string): Promise<string | null> {
    const connection = await this.getConnection(userId);
    return connection?.id ?? null;
  },

  /**
   * Delete connection
   */
  async deleteConnection(userId: string): Promise<void> {
    const { error } = await supabase
      .from('family_connections')
      .delete()
      .or(`student_id.eq.${userId},parent_id.eq.${userId}`);

    if (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  },
};
