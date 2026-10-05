import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { accent, accentHex, useScheme, type Accent } from '@/theme';
import { Text } from './Text';

type RingProgressProps = {
  /** 0–100 */
  value: number;
  color: Accent;
  size?: number;
  lineWidth?: number;
  accessibilityLabel?: string;
};

export function RingProgress({ value, color, size = 64, lineWidth = 7, accessibilityLabel }: RingProgressProps) {
  const scheme = useScheme();
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - lineWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (circumference * clamped) / 100;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: clamped, text: `${clamped} percent` }}>
      <Svg width={size} height={size} style={styles.rotate}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accentHex(color, scheme, 0.2)}
          strokeWidth={lineWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accentHex(color, scheme)}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text variant="caption1" weight="600" color={accent(color)} tabular maxFontSizeMultiplier={1.3}>
            {clamped}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rotate: { transform: [{ rotate: '-90deg' }] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
