import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuthStackScreenProps } from '../navigation/types';
import { colors } from '../theme';

type Props = AuthStackScreenProps<'Onboarding'>;

const AnimatedAura = () => {
  const auraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
          ),
        },
      ],
      opacity: withRepeat(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      ),
    };
  });

  return <Animated.View style={[styles.aura, auraStyle]} />;
};

export default function OnboardingScreen({ navigation }: Props) {
  console.log('[OnboardingScreen] Rendering OnboardingScreen');

  const handleGetStarted = () => {
    console.log('[OnboardingScreen] Get Started pressed');
    navigation.navigate('RoleSelection', { mode: 'signup' });
  };

  const handleLogin = () => {
    console.log('[OnboardingScreen] I have an account pressed');
    navigation.navigate('RoleSelection', { mode: 'login' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Decorative background elements */}
      <View style={styles.gradientTop} />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.content}>
        {/* Logo with Animated Aura */}
        <Animated.View
          entering={ZoomIn.duration(800)}
          style={styles.logoContainer}>
          <AnimatedAura />
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title and Subtitle */}
        <Animated.View
          entering={FadeIn.delay(300).duration(600)}
          style={styles.textContainer}>
          <Text style={styles.title}>Tethered</Text>
          <Text style={styles.subtitle}>
            Keep the flame alive.{'\n'}
            Authentic daily connections for{'\n'}
            students and parents.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.8}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.8}
            style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>DESIGNED FOR FAMILIES</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandCream,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FFF5F0',
    opacity: 0.5,
  },
  blob1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${colors.brandOrange}08`,
  },
  blob2: {
    position: 'absolute',
    top: 160,
    left: -80,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: `${colors.brandGreen}08`,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  logo: {
    width: 160,
    height: 160,
    zIndex: 10,
  },
  aura: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandOrange,
    opacity: 0.2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.brandDark,
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 27,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.brandDark,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 2,
    fontWeight: '700',
  },
});
