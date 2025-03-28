/**
 * PWA Utilities for iOS standalone mode detection and service worker management
 */

import { Platform } from 'react-native';

/**
 * Registers the service worker for PWA functionality
 */
export const registerServiceWorker = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/service-worker.js';

    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // Handle service worker updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older
                // content until all client tabs are closed.
                console.log('New content is available and will be used when all tabs for this page are closed.');
                
                // You could show a notification to the user here
              } else {
                // At this point, everything has been precached.
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      });
  });
};

/**
 * Checks if the app is running in standalone mode (added to home screen on iOS)
 */
export const isInStandaloneMode = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  
  return (
    ('standalone' in window.navigator && window.navigator.standalone === true) || 
    window.matchMedia('(display-mode: standalone)').matches
  );
};

/**
 * Applies standalone mode styling to the document
 */
export const applyStandaloneModeStyling = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  if (isInStandaloneMode()) {
    console.log('App is running in standalone mode');
    document.documentElement.classList.add('pwa-standalone');
    
    // Add iOS-specific fixes for PWA mode
    
    // Fix for safe areas on iOS
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
      }
      
      body.pwa-standalone {
        padding-top: var(--sat);
        padding-right: var(--sar);
        padding-bottom: var(--sab);
        padding-left: var(--sal);
      }
    `;
    document.head.appendChild(style);
    
    // Apply the class to body as well
    document.body.classList.add('pwa-standalone');
    
    return true;
  }
  
  return false;
};

/**
 * Initialize PWA functionality - called at app startup
 */
export const initPwa = () => {
  if (Platform.OS !== 'web') {
    return;
  }
  
  // Register service worker
  registerServiceWorker();
  
  // Apply standalone mode styling if applicable
  const isStandalone = applyStandaloneModeStyling();
  
  return isStandalone;
};
