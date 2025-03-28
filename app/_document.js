// This file is used to add PWA meta tags to the HTML head

// Note: The approach has been simplified to work with Expo's web bundling
// Instead of using @expo/next-document which isn't available in standard Expo
import React from 'react';
import { Platform } from 'react-native';

// We'll use a simple component that can be imported in the main layout
export function PwaMetaTags() {
  // Only include these meta tags on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      {/* 
        These meta tags will be added dynamically at runtime
        when this component is rendered in the app
      */}
    </>
  );
}

// This is a placeholder file - the actual meta tags will be injected
// through the app.json config and through the index.html template
