import { StyleSheet, View } from 'react-native';
import { Card, RingProgress, Text } from '@/components';
import type { Pillar } from '@/data/types';
import { colors, spacing } from '@/theme';

export function PulseCard({ pillars }: { pillars: Pillar[] }) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="headline" accessibilityRole="header">
          Lifestyle Pulse
        </Text>
        <Text variant="subheadline" color={colors.secondaryLabel}>
          Today
        </Text>
      </View>
      <View style={styles.rings}>
        {pillars.map((p) => (
          <View key={p.id} style={styles.pillar}>
            <RingProgress value={p.score} color={p.color} size={68} accessibilityLabel={`${p.label} score`} />
            <Text variant="subheadline" weight="500" importantForAccessibility="no" accessibilityElementsHidden>
              {p.label}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="caption1" color={colors.secondaryLabel} align="center">
        Personal estimates. Not medical or financial advice.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.lg },
  rings: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  pillar: { alignItems: 'center', gap: spacing.sm },
});
