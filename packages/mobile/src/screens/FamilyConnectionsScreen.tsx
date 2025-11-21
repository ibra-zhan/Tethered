import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { Flame } from '../components/Flame';
import { supabase } from '../lib/supabase';

interface FamilyMember {
  connection_id: string;
  member_id: string;
  member_name: string;
  member_role: string;
  member_avatar_url?: string;
  connected_at: string;
  member_streak_days: number;
}

interface FamilyConnectionsScreenProps {
  navigation: any;
}

export default function FamilyConnectionsScreen({ navigation }: FamilyConnectionsScreenProps) {
  const { currentUser } = useApp();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_family_members', {
        p_user_id: currentUser.id,
      });

      if (error) throw error;

      setFamilyMembers(data || []);
    } catch (error: any) {
      console.error('[FamilyConnections] Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family connections');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = (connectionId: string, memberName: string) => {
    Alert.alert(
      'Disconnect Family Member',
      `Are you sure you want to disconnect from ${memberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectMember(connectionId);
          },
        },
      ]
    );
  };

  const disconnectMember = async (connectionId: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase.rpc('disconnect_family_member', {
        p_connection_id: connectionId,
        p_user_id: currentUser.id,
      });

      if (error) throw error;

      // Reload family members
      await loadFamilyMembers();
      Alert.alert('Success', 'Family member disconnected');
    } catch (error: any) {
      console.error('[FamilyConnections] Error disconnecting:', error);
      Alert.alert('Error', 'Failed to disconnect family member');
    }
  };

  const handleAddFamilyMember = () => {
    navigation.navigate('AddFamilyMember');
  };

  const handleJoinFamily = () => {
    navigation.navigate('JoinFamily');
  };

  const getStreakLevel = (streakDays: number): 1 | 2 | 3 => {
    if (streakDays < 10) return 1;
    if (streakDays < 30) return 2;
    return 3;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Family</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandOrange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Family</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>People you're connected with</Text>
        </View>

        {/* Empty State */}
        {familyMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyTitle}>No family members yet</Text>
            <Text style={styles.emptySubtitle}>
              Connect with your family to share your journey together
            </Text>
            <TouchableOpacity
              onPress={handleAddFamilyMember}
              style={styles.emptyStateButton}
              activeOpacity={0.8}>
              <Text style={styles.emptyStateButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Connected Family Members */}
            <View style={styles.membersSection}>
              {familyMembers.map(member => {
                const streakLevel = getStreakLevel(member.member_streak_days);
                const isStudent = member.member_role === 'student';

                return (
                  <View key={member.connection_id} style={styles.memberCard}>
                    {/* Avatar and Info */}
                    <View style={styles.memberContent}>
                      {/* Streak Flame */}
                      <View style={styles.flameContainer}>
                        <Flame
                          state={{
                            streakDays: member.member_streak_days,
                            level: streakLevel,
                          }}
                          size="md"
                        />
                      </View>

                      {/* Member Info */}
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.member_name}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: isStudent
                                ? `${colors.brandOrange}15`
                                : `${colors.brandGreen}15`,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.roleBadgeText,
                              { color: isStudent ? colors.brandOrange : colors.brandGreen },
                            ]}>
                            {isStudent ? 'Student' : 'Parent'}
                          </Text>
                        </View>
                        <View style={styles.streakInfo}>
                          <Text style={styles.streakDays}>{member.member_streak_days} days</Text>
                          <Text style={styles.streakLabel}>streak</Text>
                        </View>
                      </View>

                      {/* Disconnect Button */}
                      <TouchableOpacity
                        onPress={() => handleDisconnect(member.connection_id, member.member_name)}
                        style={styles.disconnectButton}
                        activeOpacity={0.7}>
                        <Text style={styles.disconnectIcon}>×</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Connected Date */}
                    <Text style={styles.connectedDate}>
                      Connected {new Date(member.connected_at).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleAddFamilyMember}
                style={styles.addButton}
                activeOpacity={0.8}>
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Share My Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoinFamily}
                style={styles.joinButton}
                activeOpacity={0.8}>
                <Text style={styles.joinButtonIcon}>🔗</Text>
                <Text style={styles.joinButtonText}>Enter Code</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  subtitleContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.brandOrange,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.base,
    borderRadius: 24,
    shadowColor: colors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  membersSection: {
    paddingHorizontal: spacing.lg,
  },
  memberCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  flameContainer: {
    marginRight: spacing.base,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakDays: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  disconnectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectIcon: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  connectedDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.base,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.base,
    borderRadius: 20,
    shadowColor: colors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.base,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.brandOrange,
  },
  joinButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandOrange,
  },
});
