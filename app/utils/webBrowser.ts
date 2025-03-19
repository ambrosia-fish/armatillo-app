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
 * For web, we directly modify the auth URL to use the web callback URL
 * instead of the native scheme
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
    // Transform the URL to replace any instances of the deep link with the web URL
    let webUrl = url;
    
    // Replace native scheme with web URL
    // Example: replace "armatillo://auth/callback" with "https://app.armatillo.com/auth/callback" 
    if (redirectUrl.startsWith('armatillo://')) {
      // Extract the path part (after the scheme)
      const nativePath = redirectUrl.split('://')[1]; // "auth/callback"
      
      // Generate the correct web redirect URL
      const webRedirectUrl = `${window.location.origin}/${nativePath}`; // "https://app.armatillo.com/auth/callback"
      
      // Replace the native redirect in the URL with the web one
      webUrl = url.replace(encodeURIComponent(redirectUrl), encodeURIComponent(webRedirectUrl));
      
      // Also check for non-encoded version
      if (webUrl === url) {
        webUrl = url.replace(redirectUrl, webRedirectUrl);
      }
      
      console.log('Transformed auth URL for web:', webUrl);
    }
    
    // In web, we'll just open the URL directly in the same window
    window.location.href = webUrl;
    
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
