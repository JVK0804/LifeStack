import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ProgressBar, Sparkline, Text } from '@/components';
import { formatCurrency, formatDuration, formatLongDate } from '@/data/format';
import { lifestyleService } from '@/data/service';
import { useAsync } from '@/data/useAsync';
import { InsightCard } from '@/features/summary/InsightCard';
import { MetricCard } from '@/features/summary/MetricCard';
import { PulseCard } from '@/features/summary/PulseCard';
import { ScreenTimeCard } from '@/features/summary/ScreenTimeCard';
import { accent, colors, spacing } from '@/theme';

export default function SummaryScreen() {
  const { data: s } = useAsync(lifestyleService.getSummary);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={styles.content}>
      {!s ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <Text variant="subheadline" weight="600" color={colors.secondaryLabel} style={styles.date}>
            {formatLongDate(s.date).toUpperCase()}
          </Text>

          <PulseCard pillars={s.pillars} />

          <View style={styles.row}>
            <MetricCard
              title="Heart Rate"
              symbol="heart.fill"
              color="red"
              value={String(s.heartRate.current)}
              unit="BPM"
              caption={s.heartRate.context}
              accessibilityLabel={`Heart rate ${s.heartRate.current} beats per minute, ${s.heartRate.context}`}>
              <Sparkline data={s.heartRate.trend} color="red" />
            </MetricCard>
            <SleepMetric minutes={s.sleep.durationMinutes} quality={s.sleep.quality} />
          </View>

          <ScreenTimeCard screenTime={s.screenTime} />

          <View style={styles.row}>
            <MetricCard
              title="Budget"
              symbol="creditcard.fill"
              color="blue"
              value={formatCurrency(s.budget.spent, s.budget.currency)}
              caption={`of ${formatCurrency(s.budget.limit, s.budget.currency)} ${s.budget.period}`}
              accessibilityLabel={`Budget: spent ${formatCurrency(s.budget.spent, s.budget.currency)} of ${formatCurrency(s.budget.limit, s.budget.currency)} ${s.budget.period}`}>
              <ProgressBar progress={s.budget.spent / s.budget.limit} color="blue" />
              <Text variant="footnote" weight="600" color={accent('green')} style={styles.below}>
                {formatCurrency(s.budget.limit - s.budget.spent, s.budget.currency)} left
              </Text>
            </MetricCard>
            <HabitsMetric done={s.habits.filter((h) => h.done).length} total={s.habits.length} />
          </View>

          <InsightCard insight={s.insight} />

          <Text variant="caption1" color={colors.secondaryLabel} align="center" style={styles.disclaimer}>
            AI insights can make mistakes. Consult a professional for health or financial decisions.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

function SleepMetric({ minutes, quality }: { minutes: number; quality: number }) {
  const d = formatDuration(minutes);
  return (
    <MetricCard
      title="Sleep"
      symbol="bed.double.fill"
      color="indigo"
      value={`${d.hours}h ${d.minutes}m`}
      caption="Last night"
      accessibilityLabel={`Sleep last night ${d.spoken}, quality ${quality} percent`}>
      <ProgressBar progress={quality / 100} color="indigo" />
      <Text variant="footnote" weight="600" color={accent('indigo')} style={styles.below}>
        Quality {quality}%
      </Text>
    </MetricCard>
  );
}

function HabitsMetric({ done, total }: { done: number; total: number }) {
  return (
    <MetricCard
      title="Habits"
      symbol="checklist"
      color="orange"
      value={String(done)}
      unit={`of ${total}`}
      caption="Done today"
      accessibilityLabel={`Habits: ${done} of ${total} done today`}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i < done ? accent('orange') : colors.fill }]} />
        ))}
      </View>
    </MetricCard>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxxl },
  loading: { marginTop: spacing.xxxl },
  date: { marginBottom: -spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  below: { marginTop: spacing.sm },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  disclaimer: { marginTop: spacing.xs, paddingHorizontal: spacing.lg },
});
