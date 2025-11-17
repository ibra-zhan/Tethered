import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import { colors, spacing, typography } from '../theme';

type Props = AuthStackScreenProps<'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {/* App Icon / Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🕯️</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Candle</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Stay connected with your family through daily moments
        </Text>

        {/* User Type Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Student Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup', { userType: 'student' })}
            activeOpacity={0.8}
            style={[
              styles.card,
              {
                borderColor: colors.student,
                borderBottomColor: colors.studentDark,
              },
            ]}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.studentLight,
                    borderColor: colors.student,
                  },
                ]}
              >
                <Text style={styles.iconEmoji}>🎓</Text>
              </View>

              {/* Text */}
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>I'm a Student</Text>
                <Text style={styles.cardDescription}>Connect with your parents</Text>
              </View>

              {/* Arrow */}
              <Text style={[styles.arrow, { color: colors.student }]}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Parent Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup', { userType: 'parent' })}
            activeOpacity={0.8}
            style={[
              styles.card,
              {
                borderColor: colors.parent,
                borderBottomColor: colors.parentDark,
              },
            ]}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.parentLight,
                    borderColor: colors.parent,
                  },
                ]}
              >
                <Text style={styles.iconEmoji}>👨‍👩‍👧</Text>
              </View>

              {/* Text */}
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>I'm a Parent</Text>
                <Text style={styles.cardDescription}>Stay close to your student</Text>
              </View>

              {/* Arrow */}
              <Text style={[styles.arrow, { color: colors.parent }]}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        <Text style={styles.footer}>Meaningful connections, daily moments</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.studentLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.studentLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['4xl'],
    maxWidth: 320,
    lineHeight: 27,
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.base,
  },
  card: {
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconEmoji: {
    fontSize: 36,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  arrow: {
    fontSize: 24,
  },
  footer: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing['4xl'],
  },
});
