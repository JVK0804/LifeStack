import { DynamicColorIOS, Platform, PlatformColor, type ColorValue } from 'react-native';

/** Apple system accent colors (default appearance). Values from the HIG color specifications. */
const ACCENTS = {
  green: { light: '#34C759', dark: '#30D158' },
  red: { light: '#FF3B30', dark: '#FF453A' },
  blue: { light: '#007AFF', dark: '#0A84FF' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  orange: { light: '#FF9500', dark: '#FF9F0A' },
  teal: { light: '#30B0C7', dark: '#40C8E0' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
} as const;

export type Accent = keyof typeof ACCENTS;
export type Scheme = 'light' | 'dark';

export const ACCENT_NAMES = Object.keys(ACCENTS) as Accent[];

function withAlpha(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const a = Math.round(Math.max(0, alpha) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** Concrete hex for places that cannot take dynamic colors (e.g. SVG gradients). */
export function accentHex(name: Accent, scheme: Scheme, alpha = 1): string {
  return withAlpha(ACCENTS[name][scheme], alpha);
}

/** Accent that follows light/dark mode automatically. */
export function accent(name: Accent, alpha = 1): ColorValue {
  const { light, dark } = ACCENTS[name];
  if (Platform.OS !== 'ios') return withAlpha(light, alpha);
  return DynamicColorIOS({ light: withAlpha(light, alpha), dark: withAlpha(dark, alpha) });
}

function system(name: string, fallback: string): ColorValue {
  return Platform.OS === 'ios' ? PlatformColor(name) : fallback;
}

/** UIKit semantic colors. They adapt to dark mode and Increase Contrast with no extra work. */
export const colors = {
  groupedBackground: system('systemGroupedBackground', '#F2F2F7'),
  secondaryGroupedBackground: system('secondarySystemGroupedBackground', '#FFFFFF'),
  tertiaryGroupedBackground: system('tertiarySystemGroupedBackground', '#F2F2F7'),
  label: system('label', '#000000'),
  secondaryLabel: system('secondaryLabel', '#3C3C4399'),
  tertiaryLabel: system('tertiaryLabel', '#3C3C434D'),
  separator: system('separator', '#3C3C434A'),
  fill: system('systemFill', '#78788033'),
  secondaryFill: system('secondarySystemFill', '#78788029'),
  tertiaryFill: system('tertiarySystemFill', '#7676801F'),
  gray5: system('systemGray5', '#E5E5EA'),
  link: system('link', '#007AFF'),
  tint: accent('green'),
} as const;
