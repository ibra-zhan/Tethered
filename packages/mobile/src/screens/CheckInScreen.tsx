import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { MOODS, Mood } from '../types';
import { colors } from '../theme';
import { uploadImage } from '../utils/imageUpload';

export const CheckInScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addPost, dailyPrompt, currentUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!image || !currentUser) return;

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('[CheckIn] Starting image upload...');

      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(
        image,
        'posts',
        currentUser.id,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );

      console.log('[CheckIn] Image uploaded:', imageUrl);
      console.log('[CheckIn] Creating post...');

      // Create post with uploaded image URL
      await addPost({
        type: 'prompt-answer',
        imageUrl,
        mood,
        text,
        promptId: dailyPrompt.id,
      });

      console.log('[CheckIn] Post created successfully');

      // Navigate back to home
      navigation.navigate('Home' as never);
    } catch (err: any) {
      console.error('[CheckIn] Error submitting post:', err);
      setError(err.message || 'Failed to upload photo. Please try again.');
      setIsSubmitting(false);

      Alert.alert(
        'Upload Failed',
        'Failed to upload your photo. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStepTitle = () => {
    if (step === 1) return 'Capture Moment';
    if (step === 2) return 'How do you feel?';
    return 'Add a thought';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STEP 1: PHOTO */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.promptSection}>
              <Text style={styles.promptLabel}>TODAY'S PROMPT</Text>
              <Text style={styles.promptTextLarge}>{dailyPrompt.text}</Text>
            </View>

            <TouchableOpacity style={styles.cameraBox} onPress={pickImage}>
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraEmoji}>📸</Text>
              </View>
              <Text style={styles.cameraText}>Tap to take photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: MOOD */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
              </View>
            )}

            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.moodButton, mood === m.id && styles.moodButtonSelected]}
                  onPress={() => setMood(m.id)}>
                  <Text style={styles.moodButtonEmoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.moodButtonLabel,
                      mood === m.id && styles.moodButtonLabelSelected,
                    ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.skipButton} onPress={() => setStep(3)}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextButton, !mood && styles.nextButtonDisabled]}
                onPress={() => setStep(3)}
                disabled={!mood}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: TEXT */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
              </View>
            )}

            <Text style={styles.sectionTitle}>Add a thought (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={4}
              maxLength={200}
            />

            {isSubmitting && uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>✓ Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  promptSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandOrange,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  promptTextLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cameraBox: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraEmoji: {
    fontSize: 40,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  previewContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  moodButtonSelected: {
    backgroundColor: `${colors.brandOrange}15`,
    borderColor: colors.brandOrange,
  },
  moodButtonEmoji: {
    fontSize: 32,
  },
  moodButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  moodButtonLabelSelected: {
    color: colors.brandOrange,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandOrange,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCC',
  },
  errorText: {
    fontSize: 14,
    color: '#C33',
    textAlign: 'center',
  },
});
