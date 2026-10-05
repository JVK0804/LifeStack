import type { TextStyle } from 'react-native';

/**
 * iOS Dynamic Type text styles at the default ("Large") content size.
 * React Native scales these with the user's text size setting.
 * Font family is left unset so iOS uses San Francisco with its built-in optical sizing and tracking.
 */
export const textStyles = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '400' },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '400' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '400' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;
