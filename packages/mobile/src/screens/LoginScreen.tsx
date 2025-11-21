import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

type Props = AuthStackScreenProps<'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const userType = route.params?.userType || 'student';
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Navigation will happen automatically via auth state change
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{userType === 'student' ? '📚' : '👨‍👩‍👧'}</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to your {userType === 'student' ? 'student' : 'parent'} account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup', { userType })}>
              Create Account
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 16,
    marginLeft: 8,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCC',
  },
  errorText: {
    fontSize: 14,
    color: '#C33',
    textAlign: 'center',
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.brandDark,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  signupLink: {
    color: colors.brandOrange,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
