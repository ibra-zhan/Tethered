import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { RootStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import {
  useAuth,
  userProfileService,
  familyConnectionService,
  UserType,
} from '@tethered/shared';
import { colors, spacing, typography } from '../theme';

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

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
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
      Alert.alert('Error', 'Please enter your college name');
      return;
    }

    // Create profile with the userType
    await createProfile(userType);
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

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Let's get you set up</Text>
      </View>

      <View style={styles.form}>
        <Input label="Your Name" value={name} onChangeText={setName} placeholder="John Doe" />

        {userType === 'student' && (
          <Input
            label="College Name"
            value={collegeName}
            onChangeText={setCollegeName}
            placeholder="University Name"
          />
        )}

        <Button title="Create Profile" onPress={handleCreateProfile} loading={loading} size="lg" />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  codeCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  codeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  code: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.base,
    letterSpacing: 4,
  },
  codeInstructions: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    width: '100%',
  },
});
