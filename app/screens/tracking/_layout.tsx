import React from 'react';
import { Stack } from 'expo-router';

/**
 * Layout configuration for all tracking screens
 * This hides the default header completely, including navigation path
 */
export default function TrackingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the default header completely
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'white' },
        // Hide navigation path and breadcrumbs
        header: () => null, // This completely removes the header component
        headerBackTitle: null, // Hide back title text
        headerBackVisible: false, // Hide back button
      }}
    />
  );
}
