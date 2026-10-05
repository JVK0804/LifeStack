import Constants from 'expo-constants';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ListRow, ListSection, Text } from '@/components';
import { lifestyleService } from '@/data/service';
import { useAsync } from '@/data/useAsync';
import { accent, colors, spacing } from '@/theme';

export default function ProfileScreen() {
  const { data: p } = useAsync(lifestyleService.getProfile);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={styles.content}>
      {!p ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <View style={styles.identity} accessible accessibilityLabel={`${p.name}, ${p.email}`}>
            <View style={styles.avatar}>
              <Text variant="largeTitle" weight="700" color={accent('green')}>
                {p.name.charAt(0)}
              </Text>
            </View>
            <Text variant="title2" weight="700">
              {p.name}
            </Text>
            <Text variant="subheadline" color={colors.secondaryLabel}>
              {p.email}
            </Text>
          </View>

          <ListSection header="Preferences">
            <ListRow title="Notifications" value={p.notifications ? 'On' : 'Off'} symbol="bell.badge.fill" symbolColor="red" />
            <ListRow title="AI Suggestions" value={p.aiSuggestions ? 'On' : 'Off'} symbol="sparkles" symbolColor="purple" />
            <ListRow title="Budget Period" value={p.budgetPeriod} symbol="creditcard.fill" symbolColor="blue" />
          </ListSection>

          <ListSection header="Data" footer="LifeStack never changes your data without your approval.">
            <ListRow title="Health Data Source" value={p.healthSource} symbol="heart.fill" symbolColor="pink" />
            <ListRow title="Privacy" symbol="hand.raised.fill" symbolColor="indigo" chevron />
          </ListSection>

          <ListSection footer={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}>
            <ListRow title="Sign Out" destructive />
          </ListSection>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: spacing.xxxl },
  loading: { marginTop: spacing.xxxl },
  identity: { alignItems: 'center', gap: spacing.xxs, marginVertical: spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent('green', 0.15),
    marginBottom: spacing.sm,
  },
});
