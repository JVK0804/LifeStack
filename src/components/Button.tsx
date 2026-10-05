import * as Haptics from 'expo-haptics';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { accent, colors, MIN_TAP, radius, spacing, type Accent } from '@/theme';
import { Text } from './Text';

/** The four iOS button styles from the HIG: filled, tinted, gray and plain. */
type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain';
type ButtonSize = 'large' | 'medium' | 'small';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: Accent;
  symbol?: SFSymbol;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<ButtonSize, number> = { large: 50, medium: MIN_TAP, small: MIN_TAP };

export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'large',
  color = 'green',
  symbol,
  disabled,
  loading,
  haptic,
  accessibilityHint,
  style,
}: ButtonProps) {
  const fg = variant === 'filled' ? '#FFFFFF' : accent(color);
  const bg =
    variant === 'filled'
      ? accent(color)
      : variant === 'tinted'
        ? accent(color, 0.15)
        : variant === 'gray'
          ? colors.fill
          : 'transparent';

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      hitSlop={size === 'small' ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: HEIGHT[size],
          backgroundColor: bg,
          paddingHorizontal: variant === 'plain' ? 0 : size === 'large' ? spacing.xl : spacing.lg,
          borderRadius: size === 'large' ? radius.md + 2 : radius.pill,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {symbol && <SymbolView name={symbol} tintColor={fg} size={size === 'large' ? 17 : 15} weight="semibold" />}
          <Text variant={size === 'large' ? 'headline' : 'subheadline'} weight="600" color={fg}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.35 },
});
