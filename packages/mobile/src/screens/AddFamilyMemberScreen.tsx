import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';

interface AddFamilyMemberScreenProps {
  navigation: any;
}

export default function AddFamilyMemberScreen({ navigation }: AddFamilyMemberScreenProps) {
  const { currentUser } = useApp();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // First, check if user already has an unused invite code
      const { data: existingCodes, error: fetchError } = await supabase
        .from('invite_codes')
        .select('code, expires_at')
        .eq('user_id', currentUser.id)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let codeToUse: string;
      let expirationDate: Date;

      if (existingCodes && existingCodes.length > 0) {
        // Use existing code
        codeToUse = existingCodes[0].code;
        expirationDate = new Date(existingCodes[0].expires_at);
        console.log('[AddFamilyMember] Using existing invite code:', codeToUse);
      } else {
        // Generate a new code only if none exists
        const { data: newCode, error: generateError } = await supabase.rpc('generate_invite_code', {
          p_user_id: currentUser.id,
        });

        if (generateError) throw generateError;

        codeToUse = newCode;
        // Calculate expiration date (7 days from now)
        expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        console.log('[AddFamilyMember] Generated new invite code:', codeToUse);
      }

      setInviteCode(codeToUse);
      setExpiresAt(
        expirationDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    } catch (error: any) {
      console.error('[AddFamilyMember] Error with invite code:', error);
      Alert.alert('Error', 'Failed to load invite code');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;

    try {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard');
    } catch (error) {
      console.error('[AddFamilyMember] Error copying code:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;

    try {
      const message = `Join me on Tethered! Use my invite code: ${inviteCode}\n\nExpires: ${expiresAt}`;

      await Share.share({
        message,
      });
    } catch (error: any) {
      console.error('[AddFamilyMember] Error sharing code:', error);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDone} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Family</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandOrange} />
          <Text style={styles.loadingText}>Generating your code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Family</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationEmoji}>🔗</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Share Your Code</Text>
          <Text style={styles.instructionsText}>
            Share this code with your family member. They'll enter it in the app to connect with
            you.
          </Text>
        </View>

        {/* Code Display */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Invite Code</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{inviteCode}</Text>
          </View>
          <Text style={styles.expirationText}>Expires {expiresAt}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleCopyCode}
            style={styles.copyButton}
            activeOpacity={0.8}>
            <Text style={styles.copyButtonIcon}>📋</Text>
            <Text style={styles.copyButtonText}>Copy Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareCode}
            style={styles.shareButton}
            activeOpacity={0.8}>
            <Text style={styles.shareButtonIcon}>📤</Text>
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              This code can only be used once and will expire in 7 days. Generate a new code if
              needed.
            </Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity onPress={handleDone} style={styles.doneButton} activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>Done</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  instructionsContainer: {
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  codeCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.brandOrange,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.base,
    fontWeight: '600',
  },
  codeBadge: {
    backgroundColor: `${colors.brandOrange}10`,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: 16,
    marginBottom: spacing.base,
  },
  codeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.brandOrange,
    letterSpacing: 6,
  },
  expirationText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.base,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.brandOrange,
  },
  copyButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandOrange,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.base,
    borderRadius: 20,
    shadowColor: colors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.base,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
