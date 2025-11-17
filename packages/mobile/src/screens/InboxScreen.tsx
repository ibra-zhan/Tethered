import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import ActivityCard from '../components/ActivityCard';
import {
  useAuth,
  userProfileService,
  familyConnectionService,
  messageService,
  Message,
  UserProfile,
} from '@tethered/shared';
import { colors, spacing, getUserThemeColors } from '../theme';

type Props = MainTabScreenProps<'Inbox'>;

export default function InboxScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const [connectionId, userProfile, partnerProfile] = await Promise.all([
        familyConnectionService.getConnectionId(user.id),
        userProfileService.getProfile(user.id),
        familyConnectionService.getConnectionPartner(user.id),
      ]);

      setProfile(userProfile);
      setPartner(partnerProfile);

      if (connectionId) {
        const msgs = await messageService.getMessages(connectionId);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    const sender = isMyMessage ? profile : partner;
    const senderTheme = sender ? getUserThemeColors(sender.user_type) : null;

    return (
      <ActivityCard
        emoji={sender?.name.charAt(0) || '?'}
        emojiBackground={senderTheme?.light || (isMyMessage ? colors.studentLight : colors.parentLight)}
        borderColor={senderTheme?.main || (isMyMessage ? colors.student : colors.parent)}
        title={isMyMessage ? 'You' : `From ${partner?.name || 'Partner'}`}
        subtitle={item.message_text}
        timestamp={new Date(item.created_at).toLocaleDateString()}
        photo={item.photo_url}
      />
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        {partner && (
          <Text style={styles.subtitle}>Your connection with {partner.name}</Text>
        )}
      </View>

      {messages.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>💬</Text>
          </View>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation by sending a check-in</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        />
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.base,
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
});
