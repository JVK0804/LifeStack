import { ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '@/components';
import { colors } from '@/theme';

export default function WidgetsScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      style={{ backgroundColor: colors.groupedBackground }}>
      <EmptyState
        symbol="square.grid.2x2"
        title="No Widgets Yet"
        description="Widgets you create or approve from Lifestyle AI will appear here. Coming in the next build."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
});
