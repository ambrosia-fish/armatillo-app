// This file is used to add PWA meta tags to the HTML head
import React from 'react';
import { Platform } from 'react-native';

// Component that can be imported in the main layout to add PWA meta tags
export function PwaMetaTags() {
  // Only include these meta tags on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      {/* iOS PWA Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Armatillo" />
      
      {/* Apple touch icons */}
      <link rel="apple-touch-icon" href="/assets/images/icon.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/icon.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/icon.png" />
      
      {/* Favicon */}
      <link rel="icon" href="/assets/images/favicon.png" />
      
      {/* Web manifest */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#ffffff" />
    </>
  );
}

// Detect standalone mode (when added to home screen)
export function detectPwaMode() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if ('standalone' in window.navigator && window.navigator.standalone === true) {
      console.log("App is running in standalone mode (iOS)");
      document.documentElement.classList.add('pwa-standalone');
      return true;
    }
  }
  return false;
}
