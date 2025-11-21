import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, Post, Prompt, FlameState, UserRole } from '../types';

interface AppState {
  currentUser: User | null;
  session: Session | null;
  posts: Post[];
  streak: FlameState;
  dailyPrompt: Prompt;
  hasCheckedInToday: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  updateProfile: (name: string, avatarUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  refreshPrompt: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Default prompt in case fetch fails
const DEFAULT_PROMPT: Prompt = {
  id: 'default',
  text: 'How are you feeling today?',
  date: new Date().toISOString().split('T')[0],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [streak, setStreak] = useState<FlameState>({ streakDays: 0, level: 1 });
  const [dailyPrompt, setDailyPrompt] = useState<Prompt>(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(true);

  // Initialize auth session
  useEffect(() => {
    console.log('[AppContext] Initializing auth...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AppContext] Session fetched:', session ? 'User logged in' : 'No session');
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        console.log('[AppContext] No session, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('[AppContext] Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AppContext] Auth state changed:', _event, 'Session:', session ? 'exists' : 'null');
      if (session) {
        console.log('[AppContext] Session user ID:', session.user.id);
      }
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        console.log('[AppContext] No session, clearing user data');
        setCurrentUser(null);
        setPosts([]);
        setStreak({ streakDays: 0, level: 1 });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('[AppContext] Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log('[AppContext] User profile fetched:', data.name, data.role);
        setCurrentUser({
          id: data.id,
          name: data.name,
          role: data.role as UserRole,
          avatarUrl: data.avatar_url,
        });

        // Fetch user's posts and streak
        await Promise.all([
          fetchPosts(userId),
          fetchStreak(userId),
        ]);

        console.log('[AppContext] All data loaded, setting loading to false');
        setLoading(false);
      } else {
        // Profile doesn't exist - create a placeholder and let user complete setup
        console.log('[AppContext] No profile found for user, creating placeholder profile');

        try {
          // Get the user's email from the session
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Create a basic profile
            const { error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                name: '', // Empty name will trigger ProfileSetup screen
                role: 'student', // Default role
                avatar_url: null,
              });

            if (createError) {
              console.error('[AppContext] Error creating profile:', createError);
              await supabase.auth.signOut();
            } else {
              console.log('[AppContext] Placeholder profile created, user needs to complete setup');
              // Set a minimal user to allow ProfileSetup screen to show
              setCurrentUser({
                id: userId,
                name: '',
                role: 'student',
                avatarUrl: undefined,
              });
            }
          }
        } catch (createError) {
          console.error('[AppContext] Error in profile creation:', createError);
          await supabase.auth.signOut();
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('[AppContext] Error fetching user profile:', error);
      setLoading(false);
    }
  };

  // Fetch posts (user's posts and family members' posts)
  const fetchPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        setPosts(data.map(post => ({
          id: post.id,
          userId: post.user_id,
          type: post.type as 'check-in' | 'prompt-answer',
          imageUrl: post.image_url || undefined,
          text: post.text || undefined,
          mood: post.mood as Post['mood'],
          timestamp: new Date(post.timestamp).getTime(),
          promptId: post.prompt_id || undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Real-time subscription for new posts
  useEffect(() => {
    if (!currentUser) return;

    console.log('[AppContext] Setting up real-time subscription for posts');

    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('[AppContext] New post received:', payload.new);

          const newPost: Post = {
            id: payload.new.id,
            userId: payload.new.user_id,
            type: payload.new.type as 'check-in' | 'prompt-answer',
            imageUrl: payload.new.image_url || undefined,
            text: payload.new.text || undefined,
            mood: payload.new.mood as Post['mood'],
            timestamp: new Date(payload.new.timestamp).getTime(),
            promptId: payload.new.prompt_id || undefined,
          };

          // Add new post to the beginning of the list
          setPosts(prev => [newPost, ...prev]);
        }
      )
      .subscribe();

    return () => {
      console.log('[AppContext] Cleaning up posts subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Fetch user streak
  const fetchStreak = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setStreak({
          streakDays: data.streak_days,
          level: data.level as 1 | 2 | 3 | 4,
        });
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  // Fetch daily prompt
  useEffect(() => {
    const fetchDailyPrompt = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('daily_prompts')
          .select('*')
          .eq('date', today)
          .single();

        if (!error && data) {
          setDailyPrompt({
            id: data.id,
            text: data.text,
            date: data.date,
          });
        }
      } catch (error) {
        console.error('Error fetching daily prompt:', error);
      }
    };

    if (session) {
      fetchDailyPrompt();
    }
  }, [session]);

  // Check if user has checked in today
  const hasCheckedInToday = useMemo(() => {
    if (!currentUser) return false;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return posts.some(p => p.userId === currentUser.id && p.timestamp > startOfDay.getTime());
  }, [currentUser, posts]);

  // Signup with email and password
  const signup = async (email: string, password: string, role: UserRole) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: '', // Will be set in ProfileSetupScreen
            role,
            avatar_url: null,
          });

        if (profileError) throw profileError;

        // Note: user_streaks will be created automatically by database trigger
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      console.log('[AppContext] Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AppContext] Login error:', error);
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or create an account.');
        }
        throw error;
      }

      console.log('[AppContext] Login successful, session:', data.session ? 'exists' : 'null');
      console.log('[AppContext] User ID:', data.user?.id);
    } catch (error: any) {
      console.error('[AppContext] Login error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (name: string, avatarUrl?: string) => {
    if (!currentUser) return;

    try {
      const updateData: any = { name };
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser({
        ...currentUser,
        name,
        avatarUrl: avatarUrl || currentUser.avatarUrl,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Add post (check-in)
  const addPost = async (newPostData: Omit<Post, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id,
          type: newPostData.type,
          image_url: newPostData.imageUrl,
          text: newPostData.text,
          mood: newPostData.mood,
          prompt_id: newPostData.promptId,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Add to local state
        const newPost: Post = {
          id: data.id,
          userId: data.user_id,
          type: data.type as 'check-in' | 'prompt-answer',
          imageUrl: data.image_url || undefined,
          text: data.text || undefined,
          mood: data.mood as Post['mood'],
          timestamp: new Date(data.timestamp).getTime(),
          promptId: data.prompt_id || undefined,
        };

        setPosts(prev => [newPost, ...prev]);

        // Refresh streak (database trigger will have updated it)
        await fetchStreak(currentUser.id);
      }
    } catch (error) {
      console.error('Add post error:', error);
      throw error;
    }
  };

  // Refresh daily prompt (for testing/development)
  const refreshPrompt = async () => {
    try {
      // In production, this would call an Edge Function to generate a new prompt
      // For now, just refetch the existing prompt
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('date', today)
        .single();

      if (!error && data) {
        setDailyPrompt({
          id: data.id,
          text: data.text,
          date: data.date,
        });
      }
    } catch (error) {
      console.error('Refresh prompt error:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        session,
        posts,
        streak,
        dailyPrompt,
        hasCheckedInToday,
        loading,
        login,
        signup,
        updateProfile,
        logout,
        addPost,
        refreshPrompt,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
