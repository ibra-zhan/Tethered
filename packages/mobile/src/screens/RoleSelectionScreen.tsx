import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackScreenProps } from '../navigation/types';
import { UserRole } from '../types';
import { colors } from '../theme';

type Props = AuthStackScreenProps<'RoleSelection'>;

export default function RoleSelectionScreen({ navigation, route }: Props) {
  const { mode } = route.params; // 'signup' or 'login'
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleContinue = () => {
    if (mode === 'signup') {
      navigation.navigate('Signup', { userType: selectedRole });
    } else {
      navigation.navigate('Login', { userType: selectedRole });
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
          <Text style={styles.title}>I am a...</Text>
          <Text style={styles.subtitle}>
            {mode === 'signup' ? 'Choose your account type' : 'Select your role to sign in'}
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'student' && styles.roleButtonSelected]}
            onPress={() => setSelectedRole('student')}>
            <Text style={styles.roleEmoji}>📚</Text>
            <View style={styles.roleTextContainer}>
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'student' && styles.roleTextSelected,
                ]}>
                Student
              </Text>
              <Text style={styles.roleDescription}>Connect with your parents</Text>
            </View>
            {selectedRole === 'student' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'parent' && styles.roleButtonSelected]}
            onPress={() => setSelectedRole('parent')}>
            <Text style={styles.roleEmoji}>👨‍👩‍👧</Text>
            <View style={styles.roleTextContainer}>
              <Text
                style={[styles.roleText, selectedRole === 'parent' && styles.roleTextSelected]}>
                Parent
              </Text>
              <Text style={styles.roleDescription}>Stay close to your student</Text>
            </View>
            {selectedRole === 'parent' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.8} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
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
    marginBottom: 48,
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
  },
  roleContainer: {
    marginBottom: 32,
    gap: 16,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: colors.border,
  },
  roleButtonSelected: {
    borderColor: colors.brandOrange,
    backgroundColor: `${colors.brandOrange}08`,
  },
  roleEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleTextSelected: {
    color: colors.brandOrange,
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 24,
    color: colors.brandOrange,
    fontWeight: '700',
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.brandDark,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
