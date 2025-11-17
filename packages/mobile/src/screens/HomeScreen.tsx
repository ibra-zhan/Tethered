import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import CircularCheckInButton from '../components/CircularCheckInButton';
import StreakCard from '../components/StreakCard';
import StreakGrid from '../components/StreakGrid';
import ActivityCard from '../components/ActivityCard';
import Input from '../components/Input';
import {
  useAuth,
  userProfileService,
  familyConnectionService,
  messageService,
  UserProfile,
  Message,
} from '@tethered/shared';
import { colors, spacing, getUserThemeColors } from '../theme';

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

  // Mock streak data (can be replaced with real data later)
  const streakDays = 12;
  const streakData = Array(42).fill(0).map((_, i) => i < 35 || i >= 40);

  // Get theme colors based on user type
  const themeColors = profile ? getUserThemeColors(profile.user_type) : getUserThemeColors('student');

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

  const partnerTheme = partner ? getUserThemeColors(partner.user_type) : null;

  return (
    <ScreenContainer style={styles.container} scroll>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>

        {/* Streak Card */}
        <View style={styles.streakContainer}>
          <StreakCard streakDays={streakDays} />
        </View>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        {/* Parent's Latest Message */}
        {partner && latestMessage && (
          <ActivityCard
            variant="message"
            emoji={partner.name.charAt(0)}
            emojiBackground={partnerTheme?.light || colors.parentLight}
            borderColor={partnerTheme?.main || colors.parent}
            title={`From ${partner.name}`}
            subtitle={latestMessage.message_text}
            timestamp={new Date(latestMessage.created_at).toLocaleDateString()}
            onPress={() => navigation.navigate('Inbox')}
          />
        )}

        {/* Send Check-In Card */}
        <View
          style={[
            styles.checkInCard,
            {
              borderColor: themeColors.main,
              borderBottomColor: themeColors.dark,
            },
          ]}
        >
          <Text style={styles.checkInTitle}>Send Today's Check-In</Text>

          <View style={styles.checkInContent}>
            <CircularCheckInButton
              onPress={() => {
                navigation.navigate('Prompt', {
                  question: 'How was your day today?',
                });
              }}
            />
            <StreakGrid
              data={streakData}
              accentColor={themeColors.main}
              size="small"
            />
          </View>

          <Text style={styles.checkInSubtitle}>
            Share your day with {partner?.name || 'your family'}
          </Text>
        </View>

        {/* Guided Prompt Card */}
        <ActivityCard
          variant="prompt"
          emoji="💭"
          emojiBackground={colors.primaryLight}
          borderColor={colors.primary}
          title="What made you smile recently?"
          subtitle="Your turn to answer"
          timestamp=""
          actionText="Answer →"
          onPress={() => {
            navigation.navigate('Prompt', {
              question: 'What made you smile recently?',
            });
          }}
        />

        {/* Family Connection Card (if no partner) */}
        {!partner && profile && (
          <View
            style={[
              styles.pairingCard,
              {
                borderColor: themeColors.main,
                borderBottomColor: themeColors.dark,
              },
            ]}
          >
            <Text style={styles.pairingTitle}>Family Connection</Text>

            {profile.user_type === 'student' ? (
              <>
                <Text style={styles.pairingText}>
                  Share this code with your parent so they can connect with you:
                </Text>
                <Text style={[styles.familyCodeDisplay, { color: themeColors.main }]}>
                  {profile.family_code || 'N/A'}
                </Text>
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
                <TouchableOpacity
                  onPress={handleConnectWithCode}
                  disabled={connectLoading}
                  style={[styles.connectButton, { backgroundColor: themeColors.main }]}
                >
                  <Text style={styles.connectButtonText}>
                    {connectLoading ? 'Connecting...' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  streakContainer: {
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  checkInCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 4,
    borderBottomWidth: 5,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.base,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pairingCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 4,
    borderBottomWidth: 5,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  pairingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  pairingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  familyCodeDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    marginVertical: spacing.lg,
  },
  pairingSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  codeInput: {
    marginBottom: spacing.base,
  },
  connectButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  connectButtonText: {
    color: colors.backgroundSecondary,
    fontSize: 18,
    fontWeight: '600',
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
});
