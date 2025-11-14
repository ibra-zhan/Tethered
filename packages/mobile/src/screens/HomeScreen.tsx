import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Input from '../components/Input';
import {
  useAuth,
  userProfileService,
  familyConnectionService,
  messageService,
  UserProfile,
  Message,
} from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

type Props = MainTabScreenProps<'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [familyCode, setFamilyCode] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      const [userProfile, partnerProfile, connection] = await Promise.all([
        userProfileService.getProfile(user.id),
        familyConnectionService.getConnectionPartner(user.id),
        familyConnectionService.getConnectionId(user.id),
      ]);

      setProfile(userProfile);
      setPartner(partnerProfile);
      setConnectionId(connection);

      if (connection) {
        const latest = await messageService.getLatestMessage(connection);
        setLatestMessage(latest);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleConnectWithCode = async () => {
    if (!user) return;

    if (!familyCode.trim() || familyCode.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-character family code');
      return;
    }

    setConnectLoading(true);

    try {
      // Find student by code
      const student = await userProfileService.findStudentByFamilyCode(familyCode.trim());

      if (!student) {
        Alert.alert('Error', 'Invalid family code. Please check and try again.');
        setConnectLoading(false);
        return;
      }

      // Confirm connection
      Alert.alert(
        'Confirm Connection',
        `Connect with ${student.name}${student.college_name ? ` at ${student.college_name}` : ''}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setConnectLoading(false) },
          {
            text: 'Connect',
            onPress: async () => {
              try {
                await familyConnectionService.createConnection(student.id, user.id);
                Alert.alert('Success', 'Connected successfully!', [
                  { text: 'OK', onPress: () => loadData() },
                ]);
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to create connection');
              } finally {
                setConnectLoading(false);
                setFamilyCode('');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to find student');
      setConnectLoading(false);
    }
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
        <Text style={styles.greeting}>{getGreeting()}, {profile?.name?.split(' ')[0] || 'there'}!</Text>
      </View>

      {partner && (
        <Card style={styles.partnerCard}>
          <View style={styles.partnerHeader}>
            <Avatar uri={partner.avatar_url} name={partner.name} size="lg" />
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerRole}>
                {partner.user_type === 'student' ? '🎓 Student' : '👪 Parent'}
              </Text>
              {partner.college_name && (
                <Text style={styles.partnerCollege}>{partner.college_name}</Text>
              )}
            </View>
          </View>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Button
          title="📝 Send Check-In"
          onPress={() => {
            // TODO: Navigate to SendMessageScreen
            console.log('Send check-in');
          }}
          size="lg"
          style={styles.actionButton}
        />
      </View>

      {latestMessage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Update</Text>
          <Card>
            <Text style={styles.messageType}>
              {latestMessage.message_type === 'checkin' ? '📝 Check-in' : '💬 Message'}
            </Text>
            <Text style={styles.messageText}>{latestMessage.message_text}</Text>
            <Text style={styles.messageTime}>
              {new Date(latestMessage.created_at).toLocaleString()}
            </Text>
          </Card>
        </View>
      )}

      {!partner && profile && (
        <Card style={styles.pairingCard}>
          <Text style={styles.pairingTitle}>Family Connection</Text>

          {profile.user_type === 'student' ? (
            <>
              <Text style={styles.pairingText}>
                Share this code with your parent so they can connect with you:
              </Text>
              <Text style={styles.familyCodeDisplay}>{profile.family_code || 'N/A'}</Text>
              <Text style={styles.pairingSubtext}>
                Your parent will enter this code to connect with you.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.pairingText}>
                Enter your student's family code to connect:
              </Text>
              <Input
                value={familyCode}
                onChangeText={(text) => setFamilyCode(text.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                autoCapitalize="characters"
                containerStyle={styles.codeInput}
              />
              <Button
                title="Connect"
                onPress={handleConnectWithCode}
                loading={connectLoading}
                size="lg"
                style={styles.connectButton}
              />
            </>
          )}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
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
  partnerCard: {
    marginBottom: spacing.xl,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  partnerName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  partnerRole: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  partnerCollege: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
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
  actionButton: {
    width: '100%',
  },
  messageType: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pairingCard: {
    padding: spacing.xl,
  },
  pairingTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  pairingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  familyCodeDisplay: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 4,
    marginVertical: spacing.lg,
  },
  pairingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  codeInput: {
    marginBottom: spacing.base,
  },
  connectButton: {
    width: '100%',
  },
});
