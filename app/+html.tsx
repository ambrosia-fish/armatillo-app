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
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
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
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}

/* Add PWA standalone styles */
.pwa-standalone {
  /* Add any specific standalone mode styles here */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
}

/* Fix for tab bar in PWA mode */
@media (display-mode: standalone) {
  body {
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) 0 env(safe-area-inset-left, 0px);
  }
  
  /* Ensure tab bar extends to the bottom edge with proper padding */
  .tab-bar-container {
    padding-bottom: env(safe-area-inset-bottom, 30px) !important;
  }
}

/* Safe area detection for browsers that support it */
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* Force tab bar labels to be visible in Safari */
.tab-bar-container span, 
.tab-bar-container div[role="tab"] span,
.react-navigation__bottom-tabs span {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: static !important;
  color: rgb(72, 82, 131) !important; /* Explicitly set to primary color */
  font-size: 12px !important;
  padding-top: 4px !important;
  text-align: center !important;
  min-height: 16px !important;
}

/* Fix container height */
.tab-bar-container, 
nav.css-175oi2r, 
div[role="tablist"],
.react-navigation__bottom-tabs {
  min-height: 80px !important;
  padding-bottom: env(safe-area-inset-bottom, 30px) !important;
  display: flex !important;
  flex-direction: row !important;
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
    
    // Android standalone mode detection
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("App is running in standalone mode (Android)");
      document.documentElement.classList.add('pwa-standalone');
      document.body.classList.add('pwa-standalone');
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
