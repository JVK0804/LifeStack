import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { colors } from '@/theme';
import { Text } from './Text';

/** Standard sheet dismiss control: a bold "Done" in the trailing navigation bar position. */
export function DoneButton() {
  return (
    <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Done">
      <Text weight="600" color={colors.tint}>
        Done
      </Text>
    </Pressable>
  );
}
