import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from '@/components';
import { formatDuration } from '@/data/format';
import type { ScreenTime } from '@/data/types';
import { accent, colors, MIN_TAP, spacing } from '@/theme';

const GUIDE_URL = 'https://support.apple.com/en-us/HT208982';

export function ScreenTimeCard({ screenTime }: { screenTime: ScreenTime }) {
  const [tipIndex, setTipIndex] = useState(0);
  const { hours, minutes, spoken } = formatDuration(screenTime.minutesToday);
  const tip = screenTime.tips[tipIndex % screenTime.tips.length];

  const nextTip = () => {
    Haptics.selectionAsync();
    setTipIndex((i) => i + 1);
  };

  return (
    <Card>
      <Pressable
        onPress={() => router.push('/screen-time')}
        accessibilityRole="button"
        accessibilityLabel={`Screen Time today, ${spoken}`}
        accessibilityHint="Shows ideas for spending this time differently"
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.6 }]}>
        <SymbolView name="hourglass" tintColor={accent('blue')} size={15} weight="semibold" />
        <Text variant="subheadline" weight="600" color={accent('blue')} style={styles.flex}>
          Screen Time
        </Text>
        <SymbolView name="chevron.right" tintColor={colors.tertiaryLabel} size={13} weight="semibold" />
      </Pressable>

      <View style={styles.valueRow} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text variant="largeTitle" weight="700" tabular>
          {hours}
        </Text>
        <Text variant="title3" weight="600" color={colors.secondaryLabel}>
          hr
        </Text>
        <Text variant="largeTitle" weight="700" tabular>
          {minutes}
        </Text>
        <Text variant="title3" weight="600" color={colors.secondaryLabel}>
          min
        </Text>
      </View>

      <Text variant="subheadline" color={colors.secondaryLabel} style={styles.tip} accessibilityLiveRegion="polite">
        {tip}
      </Text>

      <View style={styles.actions}>
        <Button title="Next Tip" variant="tinted" size="small" color="blue" onPress={nextTip} />
        <Button
          title="Screen Time Guide"
          variant="plain"
          size="small"
          color="blue"
          symbol="arrow.up.right"
          accessibilityHint="Opens Apple Support in Safari"
          onPress={() => Linking.openURL(GUIDE_URL)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, minHeight: MIN_TAP - 16, marginBottom: spacing.xs },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  tip: { marginTop: spacing.xs, marginBottom: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
});
