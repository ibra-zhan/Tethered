import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { RootStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import {
  useAuth,
  userProfileService,
  UserType,
} from '@tethered/shared';
import { colors, spacing, getUserThemeColors } from '../theme';

type Props = RootStackScreenProps<'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showingAlert, setShowingAlert] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Check if profile already exists
  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    if (!user) return;

    try {
      const hasProfile = await userProfileService.hasProfile(user.id);

      if (hasProfile) {
        // Profile exists, RootNavigator will handle navigation
        console.log('[ProfileSetup] Profile exists, letting RootNavigator handle navigation');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!user) return;

    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Ask for user type if not set
    if (!userType && !showingAlert) {
      setShowingAlert(true);
      Alert.alert(
        'Select Your Role',
        'Are you a student or a parent?',
        [
          {
            text: 'Student',
            onPress: () => {
              console.log('User selected: Student');
              setUserType('student');
              setShowingAlert(false);
            },
          },
          {
            text: 'Parent',
            onPress: () => {
              console.log('User selected: Parent');
              setUserType('parent');
              setShowingAlert(false);
              // Parents don't need college, create profile immediately
              setTimeout(() => createProfile('parent'), 100);
            },
          },
        ],
        {
          cancelable: false,
          onDismiss: () => setShowingAlert(false)
        }
      );
      return;
    }

    // If userType is student and no college name, require it
    if (userType === 'student' && !collegeName.trim()) {
      setError('Please enter your college name');
      return;
    }

    // Create profile with the userType
    if (userType) {
      await createProfile(userType);
    }
  };

  const createProfile = async (type: UserType) => {
    if (!user || !name.trim()) return;

    console.log('Creating profile with type:', type);

    setLoading(true);

    try {
      const profile = await userProfileService.createProfile(user.id, {
        name: name.trim(),
        user_type: type,
        college_name: type === 'student' ? collegeName.trim() : undefined,
      });

      console.log('[ProfileSetup] Profile created:', profile);

      // Profile created - RootNavigator will automatically detect and navigate
      // Just give user feedback
      Alert.alert('Profile Created!', 'Welcome to Tethered!');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };


  if (checkingProfile) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Get theme colors based on user type (default to student if not set)
  const themeColors = getUserThemeColors(userType || 'student');

  return (
    <ScreenContainer style={styles.container} scroll>
      {/* Header with Icon */}
      <View style={styles.header}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: themeColors.light,
                borderColor: themeColors.main,
              },
            ]}
          >
            <Text style={styles.iconEmoji}>{themeColors.emoji}</Text>
          </View>
        </View>

        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
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
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={userType === 'student' ? 'Alex Smith' : 'Mom / Dad'}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              focusedField === 'name' && { borderColor: themeColors.main },
            ]}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* College Input (only for students) */}
        {userType === 'student' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>College Name</Text>
            <TextInput
              value={collegeName}
              onChangeText={setCollegeName}
              placeholder="University of California"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                focusedField === 'college' && { borderColor: themeColors.main },
              ]}
              onFocus={() => setFocusedField('college')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleCreateProfile}
          disabled={loading}
          activeOpacity={0.8}
          style={[styles.submitButton, { backgroundColor: themeColors.main }]}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Profile...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        You'll be able to connect with your family member in the next step
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing['3xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
  infoText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
