import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, userProfileService, familyConnectionService } from '@tethered/shared';

import { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  console.log('[RootNavigator] Rendering... User:', user ? user.email : 'None', 'AuthLoading:', authLoading);

  const checkUserStatus = useCallback(async () => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    try {
      console.log('[RootNavigator] Checking user profile status...');

      // Check if user has a profile
      const profileExists = await userProfileService.hasProfile(user.id);
      console.log('[RootNavigator] Has profile:', profileExists);
      setHasProfile(profileExists);
    } catch (error) {
      console.error('[RootNavigator] Error checking user status:', error);
    } finally {
      setCheckingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('[RootNavigator] User changed, checking status...');
    checkUserStatus();
  }, [user, checkUserStatus]);

  // Re-check status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && user) {
        console.log('[RootNavigator] App became active, re-checking status...');
        checkUserStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user, checkUserStatus]);

  // Periodically check for profile updates (every 2 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkUserStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [user, checkUserStatus]);

  if (authLoading || checkingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('[RootNavigator] Navigation decision:',
    !user ? 'Show Auth' :
    !hasProfile ? 'Show ProfileSetup' :
    'Show Main'
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !hasProfile ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
