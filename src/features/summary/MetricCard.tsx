import type { ReactNode } from 'react';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components';
import { accent, colors, spacing, type Accent } from '@/theme';

type MetricCardProps = {
  title: string;
  symbol: SFSymbol;
  color: Accent;
  value: string;
  unit?: string;
  caption: string;
  /** Full sentence read by VoiceOver in place of the visual pieces. */
  accessibilityLabel: string;
  children?: ReactNode;
};

export function MetricCard({ title, symbol, color, value, unit, caption, accessibilityLabel, children }: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <View accessible accessibilityLabel={accessibilityLabel}>
        <View style={styles.header}>
          <SymbolView name={symbol} tintColor={accent(color)} size={15} weight="semibold" />
          <Text variant="subheadline" weight="600" color={accent(color)}>
            {title}
          </Text>
        </View>
        <View style={styles.valueRow}>
          <Text variant="title1" weight="700" tabular>
            {value}
          </Text>
          {unit && (
            <Text variant="subheadline" weight="600" color={colors.secondaryLabel}>
              {unit}
            </Text>
          )}
        </View>
        <Text variant="footnote" color={colors.secondaryLabel}>
          {caption}
        </Text>
      </View>
      {children && <View style={styles.footer}>{children}</View>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, marginBottom: spacing.sm },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  footer: { marginTop: 'auto', paddingTop: spacing.md },
});
