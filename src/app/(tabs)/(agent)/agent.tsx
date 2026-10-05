import { ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '@/components';
import { colors } from '@/theme';

export default function AgentScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.groupedBackground }}>
      <EmptyState
        symbol="sparkles"
        title="Lifestyle AI"
        description="Describe what you'd like to track and your AI will propose a widget for you to review. Coming in the next build."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
});
