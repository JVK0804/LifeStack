import { Text as RNText, type ColorValue, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, textStyles, type TextVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ColorValue;
  weight?: TextStyle['fontWeight'];
  /** Fixed-width digits so changing numbers don't shift layout. */
  tabular?: boolean;
  align?: TextStyle['textAlign'];
};

export function Text({
  variant = 'body',
  color = colors.label,
  weight,
  tabular,
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        textStyles[variant],
        { color },
        weight && { fontWeight: weight },
        tabular && { fontVariant: ['tabular-nums'] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
