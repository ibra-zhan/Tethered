import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { RootStackScreenProps } from '../navigation/types';
import ScreenContainer from '../components/ScreenContainer';
import { colors, spacing } from '../theme';

type Props = RootStackScreenProps<'Prompt'>;

export default function PromptScreen({ route, navigation }: Props) {
  const { question } = route.params;

  const [answer, setAnswer] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('Empty Answer', 'Please write an answer before submitting');
      return;
    }

    // TODO: Submit to API
    Alert.alert('Success', 'Your answer has been submitted!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleAddPhoto = () => {
    // TODO: Implement photo picker
    Alert.alert('Coming Soon', 'Photo upload feature will be available soon!');
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>💭</Text>
          </View>
          <Text style={styles.question}>{question}</Text>
          <Text style={styles.subtitle}>Daily Question</Text>
        </View>

        {/* Answer Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>Your Answer</Text>
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Share your thoughts..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            style={styles.textInput}
          />
          <Text style={styles.characterCount}>{answer.length}/500 characters</Text>
        </View>

        {/* Photo Upload (Optional) */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Add a Photo (Optional)</Text>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity
                onPress={() => setPhoto(null)}
                style={styles.removePhotoButton}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleAddPhoto} style={styles.addPhotoButton}>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginLeft: spacing.lg,
    marginBottom: spacing.base,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  questionCard: {
    backgroundColor: '#F5F0FA',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: colors.primary,
    borderBottomWidth: 5,
    borderBottomColor: '#C5B3D8',
    padding: 32,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emoji: {
    fontSize: 42,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    height: 200,
    marginBottom: spacing.xs,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  photoSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: colors.backgroundSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  addPhotoButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  addPhotoText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
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
});
