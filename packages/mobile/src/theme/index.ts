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
