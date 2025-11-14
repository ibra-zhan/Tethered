import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

type Props = AuthStackScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);

        // Check for specific error types
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Confirmed',
            'Please check your email and confirm your account, or disable email confirmation in Supabase settings for development.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Invalid Credentials',
            'The email or password you entered is incorrect. Please try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Login Failed', error.message || 'An error occurred during login');
        }

        setLoading(false);
        return;
      }

      console.log('Login successful!');
      // On success, AuthContext will handle navigation

    } catch (err: any) {
      console.error('Login exception:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>
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
          placeholder="Your password"
          error={errors.password}
        />

        <Button title="Log In" onPress={handleLogin} loading={loading} size="lg" />

        <Text style={styles.signupText} onPress={() => navigation.goBack()}>
          Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
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
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
