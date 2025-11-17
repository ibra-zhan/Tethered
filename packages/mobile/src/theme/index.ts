export * from './colors';
export * from './spacing';
export * from './typography';
export * from './borderRadius';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { borderRadius } from './borderRadius';

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
};

export type Theme = typeof theme;

// Helper function to get theme colors based on user type
export const getUserThemeColors = (userType: 'student' | 'parent') => ({
  main: userType === 'student' ? colors.student : colors.parent,
  dark: userType === 'student' ? colors.studentDark : colors.parentDark,
  light: userType === 'student' ? colors.studentLight : colors.parentLight,
  emoji: userType === 'student' ? '📚' : '👨‍👩‍👧',
});
