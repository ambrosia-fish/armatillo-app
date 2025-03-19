/**
 * Web-compatible browser utility
 * This file provides web-compatible alternatives to expo-web-browser 
 * for when the app is running in a web browser environment.
 */

import { Platform } from 'react-native';

// Types based on expo-web-browser for compatibility
export enum WebBrowserPresentationStyle {
  FULL_SCREEN = 0,
  CURRENT_CONTEXT = 1,
  PAGE_SHEET = 2,
  FORM_SHEET = 3,
  AUTOMATIC = 4,
  OVER_FULL_SCREEN = 5
}

interface WebBrowserOpenOptions {
  createTask?: boolean;
  showInRecents?: boolean;
  dismissButtonStyle?: 'done' | 'close' | 'cancel';
  presentationStyle?: WebBrowserPresentationStyle;
  preferEphemeralSession?: boolean;
}

interface WebBrowserAuthSessionResult {
  type: 'success' | 'cancel' | 'dismiss';
  url?: string;
}

/**
 * No-op implementation for web platform to replace WebBrowser.warmUpAsync
 */
export const warmUpAsync = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.warn('webBrowser.warmUpAsync called on non-web platform');
  }
  // No-op for web
};

/**
 * No-op implementation for web platform to replace WebBrowser.coolDownAsync
 */
export const coolDownAsync = async (): Promise<void> => {
  if (Platform.OS !== 'web') {
    console.warn('webBrowser.coolDownAsync called on non-web platform');
  }
  // No-op for web
};

/**
 * Web-compatible implementation of openAuthSessionAsync
 * Opens a new tab or redirects user to the OAuth provider
 */
export const openAuthSessionAsync = async (
  url: string,
  redirectUrl: string,
  options?: WebBrowserOpenOptions
): Promise<WebBrowserAuthSessionResult> => {
  if (Platform.OS !== 'web') {
    console.warn('webBrowser.openAuthSessionAsync called on non-web platform');
    return { type: 'cancel' };
  }

  try {
    // Save the current URL so we can detect the redirect
    const currentUrl = window.location.href;
    
    // In web, we'll just open the URL directly in the same window
    window.location.href = url;
    
    // This won't actually run, as we're navigating away from the page
    // But we include it for type compatibility
    return { 
      type: 'success',
      url: redirectUrl 
    };
  } catch (error) {
    console.error('Error in webBrowser.openAuthSessionAsync:', error);
    return { type: 'cancel' };
  }
};

export default {
  warmUpAsync,
  coolDownAsync,
  openAuthSessionAsync,
  WebBrowserPresentationStyle
};
