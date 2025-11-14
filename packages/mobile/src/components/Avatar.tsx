import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography } from '../theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

const SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const FONT_SIZES = {
  sm: typography.fontSize.xs,
  md: typography.fontSize.base,
  lg: typography.fontSize.xl,
  xl: typography.fontSize['2xl'],
};

export default function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const avatarSize = SIZES[size];
  const fontSize = FONT_SIZES[size];

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  return (
    <View
      style={[
        styles.avatar,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
  },
});
