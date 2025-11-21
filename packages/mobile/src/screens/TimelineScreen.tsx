import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { MOODS } from '../types';
import { colors } from '../theme';
import { supabase } from '../lib/supabase';

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const TimelineScreen: React.FC = () => {
  const { posts, currentUser } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch posts from database
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      console.log('[Timeline] Refreshed posts:', data?.length);
    } catch (error) {
      console.error('[Timeline] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Sort posts descending
  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

  // Group posts by date
  const groupedPosts: { [key: string]: typeof posts } = {};
  sortedPosts.forEach(post => {
    const dateKey = formatDate(post.timestamp);
    if (!groupedPosts[dateKey]) groupedPosts[dateKey] = [];
    groupedPosts[dateKey].push(post);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Journal</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sortedPosts.length} Moments</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandOrange}
            colors={[colors.brandOrange]}
          />
        }>
        <View style={styles.content}>
          {Object.entries(groupedPosts).map(([dateLabel, datePosts]) => (
            <View key={dateLabel} style={styles.dateSection}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{dateLabel}</Text>
              </View>

              {datePosts.map(post => {
                const isMe = post.userId === currentUser?.id;
                const isStudent = post.userId === 'u1';

                return (
                  <View
                    key={post.id}
                    style={[styles.postContainer, isMe ? styles.postRight : styles.postLeft]}>
                    <View
                      style={[
                        styles.post,
                        isStudent ? styles.postStudent : styles.postParent,
                        isMe ? styles.postMe : styles.postOther,
                      ]}>
                      {post.imageUrl && (
                        <View style={styles.imageContainer}>
                          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                        </View>
                      )}

                      <View style={styles.postContent}>
                        {post.mood && (
                          <View style={styles.moodRow}>
                            <Text style={styles.moodEmoji}>
                              {MOODS.find(m => m.id === post.mood)?.emoji}
                            </Text>
                            {post.type === 'prompt-answer' && (
                              <Text style={styles.promptTag}>PROMPT</Text>
                            )}
                          </View>
                        )}
                        {post.text && <Text style={styles.postTextContent}>{post.text}</Text>}
                        <Text style={styles.timeText}>{formatTime(post.timestamp)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    borderWidth: 1,
    borderColor: `${colors.brandOrange}30`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandOrange,
    letterSpacing: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  dateSection: {
    marginBottom: 32,
  },
  dateBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 24,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  postContainer: {
    marginBottom: 24,
  },
  postLeft: {
    alignItems: 'flex-start',
  },
  postRight: {
    alignItems: 'flex-end',
  },
  post: {
    maxWidth: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  postStudent: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FFE5D9',
  },
  postParent: {
    backgroundColor: '#F0F7F5',
    borderColor: '#D9EBE5',
  },
  postMe: {
    borderBottomRightRadius: 4,
  },
  postOther: {
    borderBottomLeftRadius: 4,
  },
  imageContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  postContent: {
    padding: 16,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  promptTag: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.2,
  },
  postTextContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
  },
});
