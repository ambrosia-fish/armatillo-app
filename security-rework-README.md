# Armatillo App Security Rework

This branch implements a simplified security model for the Armatillo App, focusing on clean JWT authentication with minimal complexity.

## Changes Made

### Simplified Authentication Flow

- Removed complex PKCE implementation in favor of standard JWT-based authentication
- Streamlined OAuth process for Google login
- Simplified token management and storage

### Files Modified

1. **`app/utils/tokenUtils.ts`**
   - Simplified token utilities to handle basic JWT token operations
   - Removed complex validation and blacklisting features

2. **`app/utils/storage.ts`**
   - Simplified storage to use AsyncStorage directly
   - Removed encryption and complex storage mechanisms

3. **`app/services/api.ts`**
   - Updated API service to use simplified token handling
   - Streamlined request authentication

4. **`app/context/AuthContext.tsx`**
   - Dramatically reduced complexity of authentication context
   - Simplified login, logout, and token refresh processes

5. **`app/auth/callback.tsx`**
   - Simplified OAuth callback handling

6. **`app/login.tsx`**
   - Streamlined login screen functionality

7. **`app/components/AuthGuard.tsx`**
   - Simplified route protection mechanism

### Files Removed
- No longer need the following utils:
  - `mockPKCE.ts`
  - `webBrowser.ts` (can use expo-web-browser directly)
  - `webStorage.ts`
  - `encryptionUtils.ts`

## How to Test

1. Run the application in development mode
2. Try to log in with Google OAuth
3. Verify that authentication persists between app restarts
4. Verify that protected routes are still protected
5. Test the token refresh mechanism

## API Integration

This security rework aligns with the updated Armatillo API that now uses a simplified authentication model with:
- JWT tokens for authentication
- CORS protection
- Google OAuth for authentication

For more details, see the "Armatillo API Integration Guide" in the project documentation.
