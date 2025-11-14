import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;

// Initialize Supabase client
export const initSupabase = (url: string, key: string) => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    console.log('[Supabase] Client initialized');
  }
  return supabaseInstance;
};

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    throw new Error('Supabase not initialized. Call initSupabase first.');
  }
  return supabaseInstance;
};

// Export singleton instance
export const supabase = new Proxy(
  {} as SupabaseClient,
  {
    get: (target, prop) => {
      const client = getSupabaseClient();
      return client[prop as keyof SupabaseClient];
    },
  }
);
