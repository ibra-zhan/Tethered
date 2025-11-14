import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

type Props = AuthStackScreenProps<'Signup'>;

export default function SignupScreen({ route, navigation }: Props) {
  const { userType } = route.params;
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
        setLoading(false);
        return;
      }

      // Success - show confirmation
      console.log('Signup successful!');
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please complete your profile.',
        [{ text: 'Continue', onPress: () => console.log('User acknowledged success') }]
      );

      // The AuthContext will automatically navigate to ProfileSetup
      // when the user state updates

    } catch (err: any) {
      console.error('Signup exception:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up as a {userType === 'student' ? 'Student' : 'Parent'}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
        />

        <Button title="Create Account" onPress={handleSignup} loading={loading} size="lg" />

        <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
          Already have an account? <Text style={styles.loginLink}>Log in</Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.base,
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
