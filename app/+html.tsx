import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="description" content="Track habits during habit reversal training for BFRBs" />
        
        {/* PWA meta tags for iOS */}
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
        
        {/* PWA styles */}
        <link rel="stylesheet" href="/pwa-styles.css" />

        {/* Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
            However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line. */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        
        {/* Add PWA detection scripts */}
        <script dangerouslySetInnerHTML={{ __html: pwaDetectionScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
  min-height: 100vh;
  /* Critical fix for mobile browsers */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}

/* Safe area and mobile browser fix */
html {
  height: -webkit-fill-available;
}

body {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Prevent pull-to-refresh behavior which can interfere with our app */
html, body {
  overscroll-behavior-y: none;
}

/* Add PWA standalone styles */
.pwa-standalone {
  /* Add any specific standalone mode styles here */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
}
`;

const pwaDetectionScript = `
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    // iOS standalone mode detection
    if (window.navigator.standalone === true) {
      console.log("App is running in standalone mode (iOS)");
      document.documentElement.classList.add('pwa-standalone');
      document.body.classList.add('pwa-standalone');
    }
    
    // Mobile browser detection - add special class to help with CSS targeting
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      document.documentElement.classList.add('mobile-browser');
      document.body.classList.add('mobile-browser');
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function(err) {
            console.error('ServiceWorker registration failed: ', err);
          });
      });
    }
  });
}
`;
