import React from 'react';
import { Stack } from 'expo-router';

/**
 * Layout configuration for all screens
 * This provides default navigation configuration for all screens
 */
export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
        headerBackVisible: false,
        headerBackTitle: null,
        animation: 'slide_from_right',
      }}
    />
  );
}
