import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/** Inset-grouped content container, matching the cards in Apple's Health and Fitness apps. */
export function Card({ children, style, onPress, accessibilityLabel, accessibilityHint }: CardProps) {
  if (!onPress) {
    return (
      <View style={[styles.card, style]} accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.secondaryGroupedBackground,
    borderRadius: radius.card,
    borderCurve: 'continuous',
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.6,
  },
});
