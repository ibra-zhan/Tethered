import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface ActivityCardProps {
  emoji: string;
  emojiBackground: string;
  borderColor: string;
  title: string;
  subtitle: string;
  timestamp: string;
  onPress?: () => void;
  photo?: string;
  actionText?: string;
  variant?: 'default' | 'message' | 'prompt';
}

export default function ActivityCard({
  emoji,
  emojiBackground,
  borderColor,
  title,
  subtitle,
  timestamp,
  onPress,
  photo,
  actionText,
  variant = 'default',
}: ActivityCardProps) {
  // Calculate darker bottom border color
  const getDarkerBorderColor = () => {
    if (variant === 'message') return colors.parentDark;
    if (variant === 'prompt') return '#9885A8';
    return borderColor;
  };

  const renderDefault = () => (
    <View style={styles.defaultLayout}>
      {/* Emoji icon in circle */}
      <View style={[styles.emojiCircle, { backgroundColor: emojiBackground }]}>
        <Text style={styles.emojiDefault}>{emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Timestamp and optional photo */}
      <View style={styles.rightSection}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        {photo && (
          <Image source={{ uri: photo }} style={styles.photo} />
        )}
      </View>
    </View>
  );

  const renderMessage = () => (
    <>
      <View style={styles.messageHeader}>
        <View style={styles.messageLeft}>
          {/* Icon circle with border */}
          <View
            style={[
              styles.messageBubble,
              { backgroundColor: emojiBackground, borderColor },
            ]}
          >
            <Text style={styles.emojiMessage}>{emoji}</Text>
          </View>

          {/* Title */}
          <Text style={styles.messageTitle}>{title}</Text>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      {/* Message text */}
      <Text style={styles.messageText}>{subtitle}</Text>
    </>
  );

  const renderPrompt = () => (
    <>
      <View style={styles.promptHeader}>
        {/* Icon circle */}
        <View
          style={[
            styles.promptBubble,
            { backgroundColor: emojiBackground, borderColor },
          ]}
        >
          <Text style={styles.emojiPrompt}>{emoji}</Text>
        </View>

        {/* Question text */}
        <Text style={styles.promptTitle}>{title}</Text>
      </View>

      {/* Status text */}
      <Text style={styles.promptStatus}>{subtitle}</Text>

      {/* Action text */}
      {actionText && (
        <Text style={[styles.actionText, { color: borderColor }]}>
          {actionText}
        </Text>
      )}
    </>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          borderColor,
          borderBottomColor: getDarkerBorderColor(),
        },
      ]}
    >
      {variant === 'message' && renderMessage()}
      {variant === 'prompt' && renderPrompt()}
      {variant === 'default' && renderDefault()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 4,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  // Default variant styles
  defaultLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiDefault: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  timestamp: {
    fontSize: 14,
    color: '#999999',
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  // Message variant styles
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  messageBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiMessage: {
    fontSize: 26,
    fontWeight: '600',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#3D3D3D',
    lineHeight: 24,
  },
  // Prompt variant styles
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  promptBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiPrompt: {
    fontSize: 32,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
    flex: 1,
  },
  promptStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
