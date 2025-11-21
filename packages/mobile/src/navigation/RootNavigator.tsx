import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FamilyConnectionsScreen from '../screens/FamilyConnectionsScreen';
import AddFamilyMemberScreen from '../screens/AddFamilyMemberScreen';
import JoinFamilyScreen from '../screens/JoinFamilyScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { currentUser, loading } = useApp();

  console.log('[RootNavigator] Render - Loading:', loading, 'User:', currentUser?.role || 'None');

  // Show loading screen while checking auth session
  if (loading) {
    console.log('[RootNavigator] Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.brandCream }}>
        <ActivityIndicator size="large" color={colors.brandOrange} />
      </View>
    );
  }

  // Check if user has completed profile setup (has a name)
  const hasCompletedProfile = currentUser?.name && currentUser.name.length > 0;

  console.log('[RootNavigator] Not loading - User:', currentUser ? currentUser.role : 'None', 'HasProfile:', hasCompletedProfile);

  console.log('[RootNavigator] About to render NavigationContainer');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          <>
            {console.log('[RootNavigator] Rendering Auth screen')}
            <Stack.Screen name="Auth" component={AuthStack} />
          </>
        ) : !hasCompletedProfile ? (
          <>
            {console.log('[RootNavigator] Rendering ProfileSetup screen')}
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          <>
            {console.log('[RootNavigator] Rendering Main screen')}
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="FamilyConnections" component={FamilyConnectionsScreen} />
            <Stack.Screen name="AddFamilyMember" component={AddFamilyMemberScreen} />
            <Stack.Screen name="JoinFamily" component={JoinFamilyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
