import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';

export const NoConnectionScreen: React.FC = () => {
  const { currentUser } = useApp();
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    generateInviteCode();
  }, []);

  const generateInviteCode = async () => {
    if (!currentUser) return;

    try {
      // First, check if user already has an unused invite code
      const { data: existingCodes, error: fetchError } = await supabase
        .from('invite_codes')
        .select('code')
        .eq('user_id', currentUser.id)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let codeToUse: string;

      if (existingCodes && existingCodes.length > 0) {
        // Use existing code
        codeToUse = existingCodes[0].code;
        console.log('Using existing invite code:', codeToUse);
      } else {
        // Generate a new code only if none exists
        const { data: newCode, error: generateError } = await supabase.rpc('generate_invite_code', {
          p_user_id: currentUser.id,
        });

        if (generateError) throw generateError;

        codeToUse = newCode;
        console.log('Generated new invite code:', codeToUse);
      }

      if (codeToUse) {
        // Format code as XXX-XXX
        const formatted = `${codeToUse.slice(0, 3)}-${codeToUse.slice(3)}`;
        setInviteCode(formatted);
      }
    } catch (error) {
      console.error('Error with invite code:', error);
      Alert.alert('Error', 'Failed to load invite code');
    } finally {
      setLoadingCode(false);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleConnectPartner = async () => {
    if (!partnerCode || partnerCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character code');
      return;
    }

    setConnecting(true);

    try {
      // Remove hyphen if present
      const cleanCode = partnerCode.replace('-', '').toUpperCase();

      const { data, error } = await supabase.rpc('create_connection_request', {
        p_code: cleanCode,
        p_requesting_user_id: currentUser?.id,
      });

      if (error) throw error;

      if (data?.success) {
        Alert.alert(
          'Connected!',
          'You are now connected with your family member!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Force a re-render of the parent screen by navigating
                // This will trigger the connection check again
                if (navigation.getParent()) {
                  navigation.getParent()?.reset({
                    index: 0,
                    routes: [{ name: 'Main' as never }],
                  });
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Connection Failed', data?.error_message || 'Invalid code');
      }
    } catch (error: any) {
      console.error('Error connecting:', error);
      Alert.alert('Error', error.message || 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  const formatCodeInput = (text: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Limit to 6 characters
    const limited = cleaned.slice(0, 6);

    // Add hyphen after 3rd character
    if (limited.length > 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }

    return limited;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {currentUser?.name}</Text>
            <Text style={styles.subtitle}>Let's get you connected.</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile' as never)}>
            {currentUser?.avatarUrl && (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImage} />
            )}
          </TouchableOpacity>
        </View>

        {/* Flame Section */}
        <View style={styles.flameSection}>
          <View style={styles.flameContainer}>
            <Video
              source={require('../../assets/babyfire.mp4')}
              style={styles.flameVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
          <View style={styles.waitingBadge}>
            <Text style={styles.waitingText}>Waiting for spark...</Text>
          </View>
        </View>

        {/* Invite Code Card */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <View style={styles.inviteTitle}>
              <Text style={styles.lightningIcon}>⚡</Text>
              <Text style={styles.inviteTitleText}>Your Invite Code</Text>
            </View>
            <TouchableOpacity onPress={handleCopyCode} disabled={loadingCode}>
              <Text style={styles.copyButton}>Copy Code</Text>
            </TouchableOpacity>
          </View>

          {loadingCode ? (
            <ActivityIndicator size="large" color={colors.brandOrange} style={styles.codeLoader} />
          ) : (
            <>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{inviteCode}</Text>
              </View>
              <Text style={styles.inviteSubtitle}>
                Share this with your {currentUser?.role === 'student' ? 'parent' : 'student'} to link accounts.
              </Text>
            </>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ENTER THEIR CODE</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Partner Code Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="XXX-XXX"
            placeholderTextColor={colors.textTertiary}
            value={partnerCode}
            onChangeText={(text) => setPartnerCode(formatCodeInput(text))}
            autoCapitalize="characters"
            maxLength={7}
            editable={!connecting}
          />
        </View>

        {/* Connect Button */}
        <TouchableOpacity
          style={[styles.connectButton, connecting && styles.connectButtonDisabled]}
          onPress={handleConnectPartner}
          disabled={connecting || partnerCode.length < 6}>
          {connecting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.connectButtonText}>Connect Partner</Text>
              <Text style={styles.connectButtonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundTertiary,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  flameSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  flameContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  flameVideo: {
    width: 200,
    height: 200,
  },
  waitingBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandOrange,
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inviteTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightningIcon: {
    fontSize: 24,
  },
  inviteTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  copyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandOrange,
  },
  codeLoader: {
    marginVertical: 32,
  },
  codeDisplay: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 4,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  codeInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  connectButton: {
    backgroundColor: colors.brandDark,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 100,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  connectButtonArrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
  },
});
