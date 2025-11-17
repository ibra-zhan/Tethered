import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import {
  useAuth,
  userProfileService,
  familyConnectionService,
  UserProfile,
} from '@tethered/shared';
import { colors, spacing, getUserThemeColors } from '../theme';

type Props = MainTabScreenProps<'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const [userProfile, partnerProfile] = await Promise.all([
        userProfileService.getProfile(user.id),
        familyConnectionService.getConnectionPartner(user.id),
      ]);
      setProfile(userProfile);
      setPartner(partnerProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const themeColors = profile ? getUserThemeColors(profile.user_type) : getUserThemeColors('student');

  return (
    <ScreenContainer style={styles.container} scroll>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {profile && (
        <>
          {/* Profile Card */}
          <View
            style={[
              styles.profileCard,
              {
                borderColor: themeColors.main,
                borderBottomColor: themeColors.dark,
              },
            ]}
          >
            {/* Avatar Circle */}
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: themeColors.light,
                  borderColor: themeColors.main,
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>{themeColors.emoji}</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeText}>
                  {profile.user_type === 'student' ? 'Student' : 'Parent'}
                </Text>
              </View>
              {profile.user_type === 'student' && profile.college_name && (
                <Text style={styles.college}>{profile.college_name}</Text>
              )}
              {profile.user_type === 'parent' && partner && (
                <Text style={styles.college}>Connected with {partner.name}</Text>
              )}
            </View>
          </View>

          {/* Family Code (Students only) */}
          {profile.user_type === 'student' && profile.family_code && (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Family Code</Text>
              <Text style={[styles.code, { color: themeColors.main }]}>
                {profile.family_code}
              </Text>
              <Text style={styles.codeSubtext}>
                Share this code with your parent to connect
              </Text>
            </View>
          )}

          {/* Settings Menu */}
          <View style={styles.settingsSection}>
            {/* Account Settings */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>👤</Text>
              </View>
              <Text style={styles.menuText}>Account Settings</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔔</Text>
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🛡️</Text>
              </View>
              <Text style={styles.menuText}>Privacy & Security</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>❓</Text>
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutIcon}>🚪</Text>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  profileCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 4,
    borderBottomWidth: 5,
    padding: 28,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 52,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userTypeBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  college: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginVertical: spacing.sm,
  },
  codeSubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  settingsSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuChevron: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: '300',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
