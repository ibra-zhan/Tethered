import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '@tethered/shared';
import { colors, spacing } from '../theme';

type Props = AuthStackScreenProps<'Login'>;

// Purple theme for login (user type unknown)
const loginTheme = {
  main: '#B8A5C8',
  dark: '#9885A8',
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = (): boolean => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    return true;
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
    <ScreenContainer style={styles.container} scroll>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@college.edu"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              focusedField === 'email' && { borderColor: loginTheme.main },
            ]}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            style={[
              styles.input,
              focusedField === 'password' && { borderColor: loginTheme.main },
            ]}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.goBack()}>
            Create Account
          </Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing['3xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: loginTheme.main,
    borderBottomWidth: 5,
    borderBottomColor: loginTheme.dark,
    padding: 28,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEE',
    borderWidth: 2,
    borderColor: '#FCC',
    marginBottom: spacing.base,
  },
  errorText: {
    fontSize: 14,
    color: '#C33',
  },
  submitButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: loginTheme.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    color: colors.backgroundSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  signupLink: {
    color: loginTheme.main,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
