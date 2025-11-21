import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

type Props = RootStackScreenProps<'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { currentUser, updateProfile } = useApp();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      await updateProfile(name.trim());
      // Navigation will happen automatically via auth state change
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>
            {currentUser?.role === 'student' ? '📚' : '👨‍👩‍👧'}
          </Text>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Let's set up your profile</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.8}
            style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {currentUser?.role === 'student'
            ? 'This name will be visible to your parents'
            : 'This name will be visible to your student'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
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
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
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
    padding: 20,
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
  hint: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
