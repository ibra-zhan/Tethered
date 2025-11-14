import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme';

type Props = AuthStackScreenProps<'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Tethered</Text>
          <Text style={styles.subtitle}>
            Stay connected with family through daily check-ins and meaningful conversations
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button
            title="I'm a Student"
            onPress={() => navigation.navigate('Signup', { userType: 'student' })}
            size="lg"
            style={styles.button}
          />
          <Button
            title="I'm a Parent"
            onPress={() => navigation.navigate('Signup', { userType: 'parent' })}
            variant="outline"
            size="lg"
            style={styles.button}
          />

          <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
            Already have an account? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttons: {
    gap: spacing.base,
  },
  button: {
    width: '100%',
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
