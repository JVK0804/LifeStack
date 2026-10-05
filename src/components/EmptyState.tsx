import type { ReactNode } from 'react';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { Text } from './Text';

/** Equivalent of SwiftUI's ContentUnavailableView. */
export function EmptyState({
  symbol,
  title,
  description,
  action,
}: {
  symbol: SFSymbol;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <SymbolView name={symbol} tintColor={colors.secondaryLabel} size={48} />
      <Text variant="title2" weight="700" align="center" accessibilityRole="header">
        {title}
      </Text>
      {description && (
        <Text variant="subheadline" color={colors.secondaryLabel} align="center">
          {description}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.sm,
  },
  action: { marginTop: spacing.lg },
});
