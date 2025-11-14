import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import {
  useAuth,
  familyConnectionService,
  messageService,
  Message,
} from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

type Props = MainTabScreenProps<'Inbox'>;

export default function InboxScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const connectionId = await familyConnectionService.getConnectionId(user.id);
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

    return (
      <Card style={[styles.messageCard, isMyMessage && styles.myMessageCard]}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageType}>
            {item.message_type === 'checkin' && '📝 Check-in'}
            {item.message_type === 'reply' && '💬 Reply'}
            {item.message_type === 'prompt_response' && '❓ Prompt Response'}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {item.emoji && <Text style={styles.emoji}>{item.emoji}</Text>}

        <Text style={styles.messageText}>{item.message_text}</Text>
      </Card>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Send your first check-in to get started!</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  list: {
    padding: spacing.lg,
  },
  messageCard: {
    marginBottom: spacing.base,
  },
  myMessageCard: {
    backgroundColor: colors.backgroundTertiary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  messageType: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  emoji: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing.sm,
  },
  messageText: {
    fontSize: typography.fontSize.base,
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
  empty: {
    flex: 1,
    justifyContent: 'center',
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
});
