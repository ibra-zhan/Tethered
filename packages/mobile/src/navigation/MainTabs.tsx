import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../theme';

import { DashboardScreen } from '../screens/DashboardScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { CheckInScreen } from '../screens/CheckInScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icons (using emoji for simplicity)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: { [key: string]: string } = {
    Home: '🏠',
    Timeline: '📅',
    CheckIn: '➕',
  };

  return (
    <View
      style={[
        styles.tabIcon,
        focused && styles.tabIconFocused,
        name === 'CheckIn' && styles.checkInButton,
      ]}>
      <Text style={[styles.icon, name === 'CheckIn' && styles.checkInIcon]}>
        {icons[name] || '·'}
      </Text>
    </View>
  );
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brandOrange,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="CheckIn" focused={focused} />,
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              style={[props.style, styles.checkInButtonContainer]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Timeline" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    height: 70,
    borderTopWidth: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 0,
  },
  tabIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: `${colors.brandOrange}15`,
  },
  icon: {
    fontSize: 24,
  },
  checkInButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandDark,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.brandCream,
  },
  checkInButtonContainer: {
    top: -8,
  },
  checkInIcon: {
    color: '#fff',
    fontSize: 28,
  },
});
