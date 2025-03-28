# PWA Configuration for Armatillo

## Overview

This directory contains files for Progressive Web App (PWA) support. These files enable the "Add to Home Screen" functionality on iOS and other mobile browsers, allowing the web app to be used in a more app-like manner.

## Files

- `manifest.json`: The Web App Manifest that defines app metadata, icons, and display settings
- `service-worker.js`: Provides offline functionality by caching app assets
- `pwa-meta.html`: Reference HTML file with meta tags that need to be included in the final HTML output

## Manual Integration Steps

For the PWA features to work correctly when deployed, you may need to manually add the meta tags from `pwa-meta.html` to the final HTML file after building. This ensures all the necessary PWA functionality is available without causing React errors.

### Post-Build Integration

1. Build your Expo web app as normal
2. In the generated HTML file (usually `index.html` in the build directory), add the content from `pwa-meta.html` inside the `<head>` section
3. Deploy the modified HTML file along with other build assets

## Testing PWA Functionality

To test the PWA features:

1. Deploy the app to a web server (e.g., Vercel, Netlify, etc.)
2. Visit the app in Safari on iOS
3. Tap the Share button (square with up arrow)
4. Select "Add to Home Screen"
5. Launch the app from your home screen
6. The app should now open in full-screen mode without Safari UI elements

## Troubleshooting

If the app still shows browser UI elements when launched from the home screen, verify that:

1. The `apple-mobile-web-app-capable` meta tag is present in the HTML
2. The `manifest.json` file is accessible and has the correct settings
3. The app is being served over HTTPS (required for many PWA features)
