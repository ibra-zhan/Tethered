import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Flame, FlameState } from '../components/Flame';
import { generateDailyPrompt } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { MOODS, Post } from '../types';
import { colors } from '../theme';
import { NoConnectionScreen } from './NoConnectionScreen';
import { supabase } from '../lib/supabase';

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const DashboardScreen: React.FC = () => {
  const { streak, dailyPrompt, hasCheckedInToday, currentUser, refreshPrompt, posts } = useApp();
  const navigation = useNavigation();
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);
  const [checkingConnections, setCheckingConnections] = useState(true);

  const isParent = currentUser?.role === 'parent';
  const isStudent = currentUser?.role === 'student';

  // Check if user has family connections
  useEffect(() => {
    checkFamilyConnections();
  }, [currentUser]);

  // Hide/show tab bar based on connection status
  useEffect(() => {
    if (hasConnections === null) return; // Still checking

    navigation.setOptions({
      tabBarStyle: hasConnections
        ? {
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 24,
            height: 70,
            borderTopWidth: 0,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            paddingBottom: 0,
          }
        : { display: 'none' },
    });
  }, [hasConnections, navigation]);

  const checkFamilyConnections = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase.rpc('get_family_members', {
        p_user_id: currentUser.id,
      });

      if (error) {
        console.error('Error checking connections:', error);
        setHasConnections(false);
      } else {
        setHasConnections(data && data.length > 0);
      }
    } catch (error) {
      console.error('Error checking connections:', error);
      setHasConnections(false);
    } finally {
      setCheckingConnections(false);
    }
  };

  // Find the latest post from the "other" person to display
  useEffect(() => {
    if (!currentUser) return;
    const targetUserId = currentUser.id === 'u1' ? 'u2' : 'u1';

    const foundPost = posts
      .filter(p => p.userId === targetUserId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    setLatestPost(foundPost || null);
  }, [posts, currentUser]);

  const handleNewPrompt = async () => {
    setLoadingPrompt(true);
    const text = await generateDailyPrompt();
    refreshPrompt(text);
    setLoadingPrompt(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Show loading while checking connections
  if (checkingConnections) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandOrange} />
        </View>
      </SafeAreaView>
    );
  }

  // Show NoConnectionScreen if user has no family connections
  if (hasConnections === false) {
    return <NoConnectionScreen />;
  }

  // --- PARENT DASHBOARD VIEW ---
  if (isParent) {
    const hasPostToday = latestPost && Date.now() - latestPost.timestamp < 86400000;
    const moodObj = latestPost?.mood ? MOODS.find(m => m.id === latestPost.mood) : null;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {currentUser?.name}
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Your connection is active</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigation.navigate('Profile' as never)}>
              {currentUser?.avatarUrl && (
                <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImage} />
              )}
            </TouchableOpacity>
          </View>

          {/* Hero Section: Child's Update */}
          {hasPostToday && latestPost ? (
            <View style={styles.updateCard}>
              <Image source={{ uri: latestPost.imageUrl }} style={styles.updateImage} />
              <View style={styles.updateOverlay} />
              <View style={styles.updateContent}>
                <View style={styles.updateHeader}>
                  <View style={styles.updateBadge}>
                    <Text style={styles.updateBadgeText}>
                      {latestPost.type === 'prompt-answer' ? 'DAILY PROMPT' : 'CHECK-IN'}
                    </Text>
                  </View>
                  <View style={styles.timeChip}>
                    <Text style={styles.timeText}>{timeAgo(latestPost.timestamp)}</Text>
                  </View>
                </View>

                <View style={styles.updateBottom}>
                  {moodObj && (
                    <View style={styles.moodCard}>
                      <Text style={styles.moodEmoji}>{moodObj.emoji}</Text>
                      <View>
                        <Text style={styles.moodLabel}>CURRENT MOOD</Text>
                        <Text style={styles.moodText}>{moodObj.label}</Text>
                      </View>
                    </View>
                  )}

                  {latestPost.text && (
                    <View style={styles.textCard}>
                      <Text style={styles.postText}>"{latestPost.text}"</Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButtonPrimary}>
                      <Text style={styles.actionTextPrimary}>❤️ Love it</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary}>
                      <Text style={styles.actionTextSecondary}>💬 Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>⏰</Text>
              </View>
              <Text style={styles.emptyTitle}>Waiting for Alex</Text>
              <Text style={styles.emptySubtitle}>
                They haven't checked in yet today. We'll notify you when they do.
              </Text>
              <View style={styles.promptBox}>
                <Text style={styles.promptBoxLabel}>TODAY'S PROMPT</Text>
                <Text style={styles.promptBoxText}>{dailyPrompt.text}</Text>
              </View>
            </View>
          )}

          {/* Parent Check-in */}
          {!hasCheckedInToday && (
            <TouchableOpacity
              style={styles.checkInCard}
              onPress={() => navigation.navigate('CheckIn' as never)}>
              <View style={styles.checkInLeft}>
                <View style={styles.checkInIcon}>
                  <Text style={styles.checkInEmoji}>📸</Text>
                </View>
                <View>
                  <Text style={styles.checkInTitle}>Share your moment</Text>
                  <Text style={styles.checkInSubtitle}>Join the streak with Alex</Text>
                </View>
              </View>
              <Text style={styles.checkInArrow}>→</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- STUDENT DASHBOARD VIEW (Original Flame Logic) ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {currentUser?.name}
            </Text>
            <Text style={styles.subtitle}>Let's keep the flame alive.</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile' as never)}>
            {currentUser?.avatarUrl && (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImage} />
            )}
          </TouchableOpacity>
        </View>

        {/* Flame Visualization */}
        <View style={styles.flameSection}>
          <Flame state={streak} size="xl" />
          <View style={styles.flameInfo}>
            <Text style={styles.flameTitle}>
              {streak.level === 1 && 'Starting Out'}
              {streak.level === 2 && 'Steady Flame'}
              {streak.level === 3 && 'Eternal Light'}
            </Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{streak.streakDays}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Daily Prompt Card */}
        <View style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <View style={styles.promptLabel}>
              <View style={styles.promptDot} />
              <Text style={styles.promptLabelText}>DAILY PROMPT</Text>
            </View>
            <TouchableOpacity onPress={handleNewPrompt} disabled={loadingPrompt}>
              {loadingPrompt ? (
                <ActivityIndicator size="small" color={colors.brandOrange} />
              ) : (
                <Text style={styles.refreshIcon}>🔄</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.promptText}>
            {loadingPrompt ? 'Thinking of something good...' : dailyPrompt.text}
          </Text>

          {!hasCheckedInToday ? (
            <TouchableOpacity
              style={styles.answerButton}
              onPress={() => navigation.navigate('CheckIn' as never)}>
              <Text style={styles.answerButtonText}>📸 Answer Prompt</Text>
              <Text style={styles.answerButtonArrow}>→</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.doneCard}>
              <View style={styles.doneLeft}>
                <View style={styles.doneCheck}>
                  <Text style={styles.doneCheckText}>✓</Text>
                </View>
                <Text style={styles.doneText}>Done for today!</Text>
              </View>
              <Text style={styles.doneSubtext}>See Timeline</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandGreen,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundTertiary,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  updateCard: {
    height: 500,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 24,
  },
  updateImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  updateOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  updateContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  updateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  timeChip: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  updateBottom: {
    gap: 16,
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 12,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  moodText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionTextPrimary: {
    color: colors.brandDark,
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionTextSecondary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.brandOrange}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 240,
    marginBottom: 24,
  },
  promptBox: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  promptBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  promptBoxText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  checkInCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkInIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.brandGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInEmoji: {
    fontSize: 24,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  checkInSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkInArrow: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  flameSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 350,
    marginBottom: 16,
  },
  flameInfo: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  flameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
    alignItems: 'center',
  },
  streakNumber: {
    color: colors.brandOrange,
    fontWeight: '700',
    fontSize: 16,
  },
  streakLabel: {
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandOrange,
  },
  promptLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  refreshIcon: {
    fontSize: 16,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    lineHeight: 28,
  },
  answerButton: {
    backgroundColor: colors.brandDark,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  answerButtonArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 18,
  },
  doneCard: {
    backgroundColor: `${colors.brandGreen}10`,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.brandGreen}20`,
  },
  doneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneCheckText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  doneText: {
    color: colors.brandGreen,
    fontSize: 15,
    fontWeight: '600',
  },
  doneSubtext: {
    color: `${colors.brandGreen}99`,
    fontSize: 12,
  },
});
