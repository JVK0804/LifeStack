import { Stack } from 'expo-router';
import { largeTitleStackOptions } from '@/navigation/largeTitleStack';

export default function WidgetsStack() {
  return (
    <Stack screenOptions={largeTitleStackOptions}>
      <Stack.Screen name="widgets" options={{ title: 'My Widgets' }} />
    </Stack>
  );
}
