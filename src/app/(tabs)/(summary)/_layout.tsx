import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { mockProfile } from '@/data/mock';
import { largeTitleStackOptions } from '@/navigation/largeTitleStack';
import { accent } from '@/theme';

function ProfileButton() {
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Profile and settings"
      style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.6 }]}>
      <Text variant="headline" color={accent('green')}>
        {mockProfile.name.charAt(0)}
      </Text>
    </Pressable>
  );
}

export default function SummaryStack() {
  return (
    <Stack screenOptions={largeTitleStackOptions}>
      <Stack.Screen name="index" options={{ title: 'Summary', headerRight: () => <ProfileButton /> }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accent('green', 0.15),
  },
});
