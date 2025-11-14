import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session ? 'User logged in' : 'User logged out');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting signup with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error('[AuthContext] Signup error:', error);
        return { error };
      }

      console.log('[AuthContext] Signup successful!');
      console.log('[AuthContext] User:', data.user?.email);
      console.log('[AuthContext] Session:', data.session ? 'Created' : 'None - Email confirmation may be required');

      // If there's a user but no session, email confirmation is required
      if (data.user && !data.session) {
        console.log('[AuthContext] Email confirmation required');
        return {
          error: new Error(
            'Please check your email to confirm your account before logging in.'
          ) as Error,
        };
      }

      // Manually update state if we have a session
      if (data.session && data.user) {
        console.log('[AuthContext] Updating user state immediately');
        setSession(data.session);
        setUser(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Signup exception:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting signin with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] SignIn error:', error);
        return { error };
      }

      console.log('[AuthContext] SignIn successful! User:', data.user?.email);
      console.log('[AuthContext] Session:', data.session ? 'Created' : 'None');

      // Manually update state immediately (onAuthStateChange should also fire)
      if (data.session && data.user) {
        console.log('[AuthContext] Updating user state immediately');
        setSession(data.session);
        setUser(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] SignIn exception:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
