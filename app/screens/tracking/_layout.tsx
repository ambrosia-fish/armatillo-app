import React from 'react';
import { Stack } from 'expo-router';

/**
 * Layout configuration for all tracking screens
 * This hides the default header and sets up navigation options
 */
export default function TrackingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the default header
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'white' }
      }}
    />
  );
}
