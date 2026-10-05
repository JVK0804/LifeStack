import { Stack } from 'expo-router';
import { largeTitleStackOptions } from '@/navigation/largeTitleStack';

export default function AgentStack() {
  return (
    <Stack screenOptions={largeTitleStackOptions}>
      <Stack.Screen name="agent" options={{ title: 'Lifestyle AI' }} />
    </Stack>
  );
}
