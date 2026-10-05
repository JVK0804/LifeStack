import { Image } from 'expo-image';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components';
import { formatDuration } from '@/data/format';
import { mockSummary } from '@/data/mock';
import { lifestyleService } from '@/data/service';
import { useAsync } from '@/data/useAsync';
import type { Suggestion } from '@/data/types';
import { colors, radius, spacing } from '@/theme';

export default function ScreenTimeSheet() {
  const { data: suggestions } = useAsync(lifestyleService.getScreenTimeSuggestions);
  const { hours, minutes, spoken } = formatDuration(mockSummary().screenTime.minutesToday);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={styles.content}>
      <View accessible accessibilityLabel={`${spoken} today`} style={styles.valueRow}>
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
          min today
        </Text>
      </View>
      <Text variant="body" color={colors.secondaryLabel} style={styles.lede}>
        In the same time, you could do something you’ll remember. Here are a few ideas.
      </Text>

      {!suggestions ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <View style={styles.grid}>
          {suggestions.map((s) => (
            <SuggestionTile key={s.id} suggestion={s} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function SuggestionTile({ suggestion }: { suggestion: Suggestion }) {
  return (
    <Card style={styles.tile} accessibilityLabel={`${suggestion.title}. ${suggestion.description}`}>
      <Image
        source={suggestion.image}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={styles.tileText}>
        <Text variant="subheadline" weight="600">
          {suggestion.title}
        </Text>
        <Text variant="footnote" color={colors.secondaryLabel}>
          {suggestion.description}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: spacing.xxxl },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  lede: { marginTop: spacing.xs, marginBottom: spacing.xl },
  loading: { marginTop: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '40%', flexGrow: 1, padding: 0, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  tileText: { padding: spacing.md, gap: spacing.xxs },
});
