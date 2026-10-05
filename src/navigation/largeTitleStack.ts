import type { ComponentProps } from 'react';
import type { Stack } from 'expo-router';

type StackOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/** Shared header for top-level tab screens: collapsing large title over grouped background. */
export const largeTitleStackOptions: StackOptions = {
  headerLargeTitle: true,
  headerTransparent: true,
  headerBlurEffect: 'systemChromeMaterial',
  headerLargeTitleShadowVisible: false,
  headerShadowVisible: false,
};
