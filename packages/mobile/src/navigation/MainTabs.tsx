import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icons using simple shapes
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.homeIcon, { borderColor: focused ? colors.student : colors.textSecondary }]}>
      <View style={[styles.homeRoof, { borderBottomColor: focused ? colors.student : colors.textSecondary }]} />
    </View>
  </View>
);

const InboxIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.messageIcon, { borderColor: focused ? colors.student : colors.textSecondary }]}>
      <View style={[styles.messageTail, { borderTopColor: focused ? colors.student : colors.textSecondary }]} />
    </View>
  </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.userIconHead, { backgroundColor: focused ? colors.student : colors.textSecondary }]} />
    <View style={[styles.userIconBody, { borderColor: focused ? colors.student : colors.textSecondary }]} />
  </View>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.student,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Home') return <HomeIcon focused={focused} />;
          if (route.name === 'Inbox') return <InboxIcon focused={focused} />;
          if (route.name === 'Profile') return <ProfileIcon focused={focused} />;
          return null;
        },
        tabBarShowLabel: true, // Always show label to match design
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Home icon (house shape)
  homeIcon: {
    width: 20,
    height: 14,
    borderWidth: 2,
    borderTopWidth: 0,
    position: 'relative',
  },
  homeRoof: {
    position: 'absolute',
    top: -10,
    left: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // Message icon (speech bubble)
  messageIcon: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
    position: 'relative',
  },
  messageTail: {
    position: 'absolute',
    bottom: -6,
    left: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // User icon (person shape)
  userIconHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 1,
  },
  userIconBody: {
    width: 16,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
