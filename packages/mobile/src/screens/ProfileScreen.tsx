import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import {
  useAuth,
  userProfileService,
  UserProfile,
} from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

type Props = MainTabScreenProps<'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await userProfileService.getProfile(user.id);
      setProfile(userProfile);
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

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {profile && (
        <>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar uri={profile.avatar_url} name={profile.name} size="xl" />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.userType}>
                  {profile.user_type === 'student' ? '🎓 Student' : '👪 Parent'}
                </Text>
                {profile.college_name && (
                  <Text style={styles.college}>{profile.college_name}</Text>
                )}
              </View>
            </View>
          </Card>

          {profile.user_type === 'student' && profile.family_code && (
            <Card style={styles.codeCard}>
              <Text style={styles.codeLabel}>Family Code</Text>
              <Text style={styles.code}>{profile.family_code}</Text>
            </Card>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </Card>
          </View>

          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            size="lg"
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  userType: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  college: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  codeCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  infoCard: {
    marginBottom: spacing.base,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
});
