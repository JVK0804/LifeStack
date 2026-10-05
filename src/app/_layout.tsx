import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DoneButton } from '@/components/DoneButton';
import { useScheme } from '@/theme';

export default function RootLayout() {
  const scheme = useScheme();
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', title: 'Profile', headerRight: () => <DoneButton /> }}
        />
        <Stack.Screen
          name="screen-time"
          options={{ presentation: 'modal', title: 'Screen Time', headerRight: () => <DoneButton /> }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
