import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { AuthStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '@tethered/shared';
import { colors, spacing, typography, getUserThemeColors } from '../theme';

type Props = AuthStackScreenProps<'Signup'>;

export default function SignupScreen({ route, navigation }: Props) {
  const { userType } = route.params;
  const { signUp } = useAuth();
  const themeColors = getUserThemeColors(userType);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = (): boolean => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    return true;
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
    <ScreenContainer style={styles.container} scroll>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join as a {userType}</Text>
      </View>

      {/* Form Card */}
      <View
        style={[
          styles.formCard,
          {
            borderColor: themeColors.main,
            borderBottomColor: themeColors.dark,
          },
        ]}
      >
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
              focusedField === 'email' && { borderColor: themeColors.main },
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
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            style={[
              styles.input,
              focusedField === 'password' && { borderColor: themeColors.main },
            ]}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            style={[
              styles.input,
              focusedField === 'confirmPassword' && { borderColor: themeColors.main },
            ]}
            onFocus={() => setFocusedField('confirmPassword')}
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
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
          style={[styles.submitButton, { backgroundColor: themeColors.main }]}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text
            style={[styles.loginLink, { color: themeColors.main }]}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
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
    borderBottomWidth: 5,
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
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  loginLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
