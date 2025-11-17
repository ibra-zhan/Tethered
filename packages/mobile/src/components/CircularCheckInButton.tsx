import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface CircularCheckInButtonProps {
  onPress: () => void;
}

export default function CircularCheckInButton({ onPress }: CircularCheckInButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.button}
        activeOpacity={0.8}
      >
        {/* Play icon triangle */}
        <View style={styles.playIcon} />
      </TouchableOpacity>

      {/* Text below button */}
      <Text style={styles.text}>SEND CHECK-IN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: colors.student,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 0,
    borderBottomWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: colors.student,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 4, // Optical centering
  },
  text: {
    marginTop: spacing.base,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2.5,
    color: colors.text,
  },
});
