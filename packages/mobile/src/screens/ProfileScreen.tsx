import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { colors } from '../theme';

type Props = RootStackScreenProps<'Profile'>;

interface FamilyMember {
  id: string;
  name: string;
  role: 'student' | 'parent';
  streakDays: number;
}

export default function ProfileScreen({ navigation }: Props) {
  const { currentUser, logout } = useApp();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase.rpc('get_family_members', {
        p_user_id: currentUser.id,
      });

      if (error) {
        console.error('Error loading family members:', error);
      } else if (data) {
        setFamilyMembers(
          data.map((member: any) => ({
            id: member.member_id,
            name: member.member_name,
            role: member.member_role,
            streakDays: member.member_streak_days || 0,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>
              {currentUser.role === 'student' ? '🎓' : '👨‍👩‍👧'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{currentUser.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {currentUser.role === 'student' ? 'Student' : 'Parent'}
              </Text>
            </View>
          </View>
        </View>

        {/* Family Connections Summary */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={colors.brandOrange} />
          </View>
        ) : familyMembers.length > 0 ? (
          <View style={styles.familyCard}>
            <Text style={styles.familyLabel}>CONNECTED FAMILY</Text>
            {familyMembers.map((member) => (
              <View key={member.id} style={styles.familyMember}>
                <View style={styles.familyMemberLeft}>
                  <Text style={styles.familyMemberEmoji}>
                    {member.role === 'student' ? '🎓' : '👨‍👩‍👧'}
                  </Text>
                  <View>
                    <Text style={styles.familyMemberName}>{member.name}</Text>
                    <Text style={styles.familyMemberRole}>
                      {member.role === 'student' ? 'Student' : 'Parent'}
                    </Text>
                  </View>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakNumber}>{member.streakDays}</Text>
                  <Text style={styles.streakLabel}>🔥</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Settings Menu */}
        <View style={styles.settingsSection}>
          {/* Family Connections */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('FamilyConnections')}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👨‍👩‍👧‍👦</Text>
            </View>
            <Text style={styles.menuText}>Family Connections</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👤</Text>
            </View>
            <Text style={styles.menuText}>Account Settings</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔔</Text>
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Privacy & Security */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🛡️</Text>
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>❓</Text>
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.brandOrange,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  familyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  familyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  familyMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  familyMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  familyMemberEmoji: {
    fontSize: 32,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  familyMemberRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandOrange,
  },
  streakLabel: {
    fontSize: 12,
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuChevron: {
    fontSize: 24,
    color: colors.textTertiary,
    fontWeight: '300',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 100,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});
