import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components';
import type { Insight } from '@/data/types';
import { accent, colors, radius, spacing } from '@/theme';

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card
      onPress={() => router.navigate('/agent')}
      accessibilityLabel={insight.title}
      accessibilityHint={insight.prompt}
      style={styles.card}>
      <View style={styles.icon}>
        <SymbolView name="sparkles" tintColor="#FFFFFF" size={17} />
      </View>
      <View style={styles.text}>
        <Text variant="subheadline" weight="600">
          {insight.title}
        </Text>
        <Text variant="footnote" color={colors.secondaryLabel}>
          {insight.prompt}
        </Text>
      </View>
      <SymbolView name="chevron.right" tintColor={colors.tertiaryLabel} size={13} weight="semibold" />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent('green'),
  },
  text: { flex: 1, gap: spacing.xxs },
});
