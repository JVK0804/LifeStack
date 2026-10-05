import { Children, Fragment, type ReactNode } from 'react';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { accent, colors, MIN_TAP, radius, spacing, type Accent } from '@/theme';
import { Text } from './Text';

/** Inset-grouped list section, as used in iOS Settings. */
export function ListSection({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      {header && (
        <Text variant="footnote" color={colors.secondaryLabel} style={styles.header} accessibilityRole="header">
          {header.toUpperCase()}
        </Text>
      )}
      <View style={styles.group}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {row}
            {i < rows.length - 1 && <View style={styles.separator} />}
          </Fragment>
        ))}
      </View>
      {footer && (
        <Text variant="footnote" color={colors.secondaryLabel} style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

type ListRowProps = {
  title: string;
  value?: string;
  symbol?: SFSymbol;
  symbolColor?: Accent;
  onPress?: () => void;
  destructive?: boolean;
  /** Shows a disclosure chevron; defaults to true when the row is tappable. */
  chevron?: boolean;
};

export function ListRow({ title, value, symbol, symbolColor = 'blue', onPress, destructive, chevron }: ListRowProps) {
  const showChevron = chevron ?? (!!onPress && !destructive);
  const content = (
    <>
      {symbol && (
        <View style={[styles.iconTile, { backgroundColor: accent(symbolColor) }]}>
          <SymbolView name={symbol} tintColor="#FFFFFF" size={17} />
        </View>
      )}
      <Text style={styles.title} color={destructive ? accent('red') : colors.label} align={destructive ? 'center' : undefined}>
        {title}
      </Text>
      {value && <Text color={colors.secondaryLabel}>{value}</Text>}
      {showChevron && <SymbolView name="chevron.right" tintColor={colors.tertiaryLabel} size={13} weight="semibold" />}
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.row} accessible accessibilityLabel={value ? `${title}, ${value}` : title}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}, ${value}` : title}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.gray5 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xxl + spacing.xs },
  header: { marginHorizontal: spacing.lg, marginBottom: spacing.xs + 2 },
  footer: { marginHorizontal: spacing.lg, marginTop: spacing.xs + 2 },
  group: {
    backgroundColor: colors.secondaryGroupedBackground,
    borderRadius: radius.md - 2,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  row: {
    minHeight: MIN_TAP,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: { flex: 1 },
  iconTile: {
    width: 29,
    height: 29,
    borderRadius: 7,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: spacing.lg,
  },
});
