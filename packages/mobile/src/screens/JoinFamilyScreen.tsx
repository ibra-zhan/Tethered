import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';

interface JoinFamilyScreenProps {
  navigation: any;
}

interface CodeOwnerInfo {
  code_owner_id: string;
  code_owner_name: string;
  code_owner_role: string;
}

export default function JoinFamilyScreen({ navigation }: JoinFamilyScreenProps) {
  const { currentUser } = useApp();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    ownerInfo?: CodeOwnerInfo;
    errorMessage?: string;
  } | null>(null);

  useEffect(() => {
    // Auto-verify when code is 6 characters
    if (code.length === 6) {
      verifyCode();
    } else {
      setVerificationResult(null);
    }
  }, [code]);

  const verifyCode = async () => {
    if (!currentUser || code.length !== 6) return;

    try {
      setIsVerifying(true);
      setVerificationResult(null);

      const { data, error } = await supabase.rpc('verify_invite_code', {
        p_code: code.toUpperCase(),
        p_requesting_user_id: currentUser.id,
      });

      if (error) throw error;

      // data is an array with single row
      const result = data[0];

      if (result.is_valid) {
        setVerificationResult({
          isValid: true,
          ownerInfo: {
            code_owner_id: result.code_owner_id,
            code_owner_name: result.code_owner_name,
            code_owner_role: result.code_owner_role,
          },
        });
      } else {
        setVerificationResult({
          isValid: false,
          errorMessage: result.error_message,
        });
      }
    } catch (error: any) {
      console.error('[JoinFamily] Error verifying code:', error);
      setVerificationResult({
        isValid: false,
        errorMessage: 'Failed to verify code',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser || !verificationResult?.isValid) return;

    try {
      Keyboard.dismiss();
      setIsConnecting(true);

      const { data, error } = await supabase.rpc('create_connection_request', {
        p_code: code.toUpperCase(),
        p_requesting_user_id: currentUser.id,
      });

      if (error) throw error;

      // data is an array with single row
      const result = data[0];

      if (result.success) {
        Alert.alert(
          'Connected!',
          `You're now connected with ${verificationResult.ownerInfo?.code_owner_name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to family connections screen
                navigation.navigate('FamilyConnections');
              },
            },
          ]
        );
      } else {
        Alert.alert('Connection Failed', result.error_message);
      }
    } catch (error: any) {
      console.error('[JoinFamily] Error creating connection:', error);
      Alert.alert('Error', 'Failed to create connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters, max 6
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(cleaned);
  };

  const isCodeComplete = code.length === 6;
  const canConnect = isCodeComplete && verificationResult?.isValid && !isConnecting;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Join Family</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationEmoji}>🔐</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Enter Invite Code</Text>
          <Text style={styles.instructionsText}>
            Enter the 6-character code your family member shared with you
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={handleCodeChange}
            placeholder="XXXXXX"
            placeholderTextColor={colors.textTertiary}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            keyboardType="default"
          />

          {/* Verification Status */}
          <View style={styles.statusContainer}>
            {isVerifying && (
              <View style={styles.verifyingStatus}>
                <ActivityIndicator size="small" color={colors.brandOrange} />
                <Text style={styles.verifyingText}>Verifying...</Text>
              </View>
            )}

            {!isVerifying && verificationResult?.isValid && (
              <View style={styles.validStatus}>
                <Text style={styles.validIcon}>✓</Text>
                <Text style={styles.validText}>Valid code</Text>
              </View>
            )}

            {!isVerifying && verificationResult && !verificationResult.isValid && (
              <View style={styles.invalidStatus}>
                <Text style={styles.invalidIcon}>✕</Text>
                <Text style={styles.invalidText}>{verificationResult.errorMessage}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Owner Info Card */}
        {verificationResult?.isValid && verificationResult.ownerInfo && (
          <View style={styles.ownerCard}>
            <Text style={styles.ownerLabel}>Connect with</Text>
            <Text style={styles.ownerName}>{verificationResult.ownerInfo.code_owner_name}</Text>
            <View
              style={[
                styles.ownerRoleBadge,
                {
                  backgroundColor:
                    verificationResult.ownerInfo.code_owner_role === 'student'
                      ? `${colors.brandOrange}15`
                      : `${colors.brandGreen}15`,
                },
              ]}>
              <Text
                style={[
                  styles.ownerRoleText,
                  {
                    color:
                      verificationResult.ownerInfo.code_owner_role === 'student'
                        ? colors.brandOrange
                        : colors.brandGreen,
                  },
                ]}>
                {verificationResult.ownerInfo.code_owner_role === 'student' ? 'Student' : 'Parent'}
              </Text>
            </View>
          </View>
        )}

        {/* Connect Button */}
        <TouchableOpacity
          onPress={handleConnect}
          disabled={!canConnect}
          style={[styles.connectButton, !canConnect && styles.connectButtonDisabled]}
          activeOpacity={0.8}>
          {isConnecting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.connectButtonIcon}>🔗</Text>
              <Text style={styles.connectButtonText}>Connect</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Make sure you trust the person you're connecting with. You'll be able to see each
              other's check-ins and streaks.
            </Text>
          </View>
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
  inputContainer: {
    marginBottom: spacing.xl,
  },
  codeInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 3,
    borderColor: colors.brandOrange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusContainer: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  verifyingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  validStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  validIcon: {
    fontSize: 18,
    color: colors.success,
  },
  validText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  invalidStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.danger}15`,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  invalidIcon: {
    fontSize: 18,
    color: colors.danger,
  },
  invalidText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
  ownerCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ownerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  ownerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ownerRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownerRoleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.base,
    borderRadius: 20,
    marginBottom: spacing.xl,
    shadowColor: colors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButtonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0,
  },
  connectButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.base,
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
});
