# Armatillo App Security Rework

This branch implements a simplified security model for the Armatillo App, focusing on username/password authentication with JWT tokens.

## Changes Made

### Username/Password Authentication

- Implemented standard username/password authentication
- Created new login/signup UI with email, username, and password fields
- Implemented form validation for login and registration

### Simplified Security

- Streamlined token management using straightforward JWT handling
- Removed complex validation and blacklisting features
- Simplified storage to use AsyncStorage directly
- Removed test user functionality

### Files Modified

1. **`app/utils/tokenUtils.ts`**
   - Simplified token utilities to handle basic JWT token operations

2. **`app/utils/storage.ts`**
   - Simplified storage to use AsyncStorage directly

3. **`app/services/api.ts`**
   - Updated API service to use JWT authentication

4. **`app/context/AuthContext.tsx`**
   - Simplified authentication context for username/password auth
   - Removed OAuth-specific logic and test user functionality

5. **`app/login.tsx`**
   - Completely redesigned with username/password form
   - Added toggle for signup with additional fields

### Files Removed
- `app/utils/securityUtils.ts` - OAuth security utilities
- `app/utils/mockPKCE.ts` - PKCE implementation
- `app/utils/webBrowser.ts` - Web browser utilities for OAuth
- `app/utils/webStorage.ts` - Web storage implementation
- `app/utils/encryptionUtils.ts` - Encryption utilities
- `app/utils/testUserUtils.ts` - Test user utilities
- `app/auth/callback.tsx` - OAuth callback handler
- `app/auth/pending.tsx` - Test user pending screen

### How to Test

1. Run the application in development mode
2. Try creating a new account using the sign-up form
3. Try logging in with email and password
4. Verify that authentication persists between app restarts
5. Verify that protected routes are still protected

## API Integration

This security rework aligns with the updated Armatillo API that now uses a simplified authentication model with:
- JWT tokens for authentication
- CORS protection
- Username/password login
