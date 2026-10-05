import { useColorScheme } from 'react-native';
import type { Scheme } from './colors';

export function useScheme(): Scheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
