# Web Authentication Support

This document outlines the changes made to support web authentication in the Armatillo app.

## Key Files Added/Modified

1. **`webStorage.ts`** - A web-compatible storage module that provides fallbacks for SecureStore
2. **`webBrowser.ts`** - A web-compatible browser module that handles OAuth redirects
3. **`storage.ts`** - Updated to use webStorage on web platform
4. **`encryptionUtils.ts`** - Updated with web-specific device identification
5. **`login.tsx`** - Updated to handle web platform login flow

## OAuth Flow on Web

The OAuth flow on web platforms works differently from native platforms:

1. When the app runs on the web, it detects the platform and uses web-specific implementations
2. The redirect URL is changed from the native scheme (`armatillo://auth/callback`) to a web URL (`https://yourapp.com/auth/callback`)
3. After authentication, the app handles the redirect back to the web app

## Manual AuthContext Changes Required

You'll need to manually update the `AuthContext.tsx` file with these changes:

1. Import WebBrowser from both native and web implementations:
   ```typescript
   import * as NativeWebBrowser from 'expo-web-browser';
   import webBrowser from '../utils/webBrowser';
   const WebBrowser = Platform.OS === 'web' ? webBrowser : NativeWebBrowser;
   ```

2. Update the URL handling in `handleAuthResponse` to handle web URLs:
   ```typescript
   // Extract query parameters from the URL
   let authCode, state, error, errorDescription, newToken, expiresIn, refreshToken;
    
   // Handle URL format differences between web and native
   if (Platform.OS === 'web') {
     // For web, we can use URL API
     try {
       const urlObj = new URL(url);
       authCode = urlObj.searchParams.get('code');
       state = urlObj.searchParams.get('state');
       error = urlObj.searchParams.get('error');
       errorDescription = urlObj.searchParams.get('error_description');
       newToken = urlObj.searchParams.get('token');
       expiresIn = urlObj.searchParams.get('expires_in');
       refreshToken = urlObj.searchParams.get('refresh_token');
       
       // If there's a hash fragment, also try to parse that
       if (urlObj.hash && urlObj.hash.length > 1) {
         const hashParams = new URLSearchParams(urlObj.hash.substring(1));
         
         // Only use hash parameters if we don't already have values
         if (!authCode) authCode = hashParams.get('code');
         // ... (get other parameters from hash if needed)
       }
     } catch (urlError) {
       // Fall back to manual parsing
     }
   } else {
     // Original native URL parsing
   }
   ```

3. Use the correct redirect URI based on platform:
   ```typescript
   // Determine proper redirect URI based on platform
   const redirectUri = Platform.OS === 'web' 
     ? `${window.location.origin}/auth/callback`
     : 'armatillo://auth/callback';
   ```

4. Handle navigation differently on web:
   ```typescript
   // Navigate to home based on platform
   if (Platform.OS === 'web') {
     window.location.href = '/';
   } else {
     router.replace('/(tabs)');
   }
   ```

## Testing the Web Authentication

To test web authentication:

1. Make sure your backend API supports both the native and web redirect URLs
2. Deploy your app to the web or run it in development mode
3. Try logging in through the web interface
4. Check the browser console for any errors during the authentication process

## Security Considerations

- Web storage is less secure than native secure storage, but we've implemented encryption
- OAuth state verification is still performed to prevent CSRF attacks
- Device identification has been adapted for web characteristics

These changes help maintain a consistent authentication experience across platforms while addressing the platform-specific requirements of web and native environments.
