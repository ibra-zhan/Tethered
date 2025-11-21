import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export interface FlameState {
  streakDays: number;
  level: 1 | 2 | 3; // 1=Starting (1-9 days), 2=Steady (10-29 days), 3=Eternal (30+ days)
}

interface FlameProps {
  state: FlameState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Flame: React.FC<FlameProps> = ({ state, size = 'md' }) => {
  const videoRef = useRef<Video>(null);

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 30;
      case 'md':
        return 60;
      case 'lg':
        return 100;
      case 'xl':
        return 160;
      default:
        return 60;
    }
  };

  const containerSize = getSize();

  // Get video source based on streak days
  const getVideoSource = () => {
    if (state.streakDays < 10) {
      return require('../../assets/babyfire.mp4');
    } else if (state.streakDays < 30) {
      return require('../../assets/MidFire.mp4');
    } else {
      return require('../../assets/finalFire.mp4');
    }
  };

  // Play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
  }, []);

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Flame video */}
      <View style={styles.flameContainer}>
        <Video
          ref={videoRef}
          source={getVideoSource()}
          style={[styles.video, { width: containerSize, height: containerSize }]}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
          isMuted
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flameContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    backgroundColor: 'transparent',
  },
});
