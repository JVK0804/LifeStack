import { StyleSheet, View } from 'react-native';
import { accent, radius, type Accent } from '@/theme';

type ProgressBarProps = {
  /** 0–1 */
  progress: number;
  color: Accent;
  accessibilityLabel?: string;
};

export function ProgressBar({ progress, color, accessibilityLabel }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={[styles.track, { backgroundColor: accent(color, 0.2) }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: accent(color) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
