import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, initSupabase, queryClient } from '@tethered/shared';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Initialize Supabase with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export default function App() {
  useEffect(() => {
    console.log('Initializing Supabase...');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing');

    if (supabaseUrl && supabaseAnonKey) {
      try {
        initSupabase(supabaseUrl, supabaseAnonKey);
        console.log('Supabase initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
      }
    } else {
      console.error('Missing Supabase credentials. Please check your .env file.');
      console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl);
      console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present but hidden' : 'Missing');
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
