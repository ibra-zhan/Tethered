import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface StreakCardProps {
  streakDays: number;
}

export default function StreakCard({ streakDays }: StreakCardProps) {
  return (
    <View style={styles.container}>
      {/* Fire emoji */}
      <Text style={styles.fireEmoji}>🔥</Text>

      {/* Streak number and text */}
      <View style={styles.textContainer}>
        <Text style={styles.number}>{streakDays}</Text>
        <Text style={styles.label}>day streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  fireEmoji: {
    fontSize: 48,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  number: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F5A962',
    lineHeight: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
