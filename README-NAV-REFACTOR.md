# Authentication and Navigation Refactor

This branch (`nav-refactor`) contains comprehensive improvements to the authentication and navigation system in the Armatillo app to solve issues with login, logout, and navigation between screens. The code has been refactored to be more robust, handle errors better, and work consistently across platforms (iOS, Android, and Web).

## Key Improvements

### 1. State Machine Pattern for Authentication

The authentication system now uses a proper state machine pattern with well-defined states:
- `INITIALIZING`: App is loading authentication state
- `AUTHENTICATED`: User is logged in
- `UNAUTHENTICATED`: User is not logged in
- `LOGGING_OUT`: User is in the process of logging out
- `PENDING_APPROVAL`: User account is pending approval

This makes state transitions more predictable and solves race conditions in the previous implementation.

### 2. Improved Error Handling

- Consistent use of the global error system (`errorService`) throughout the app
- Better error context information for debugging
- More user-friendly error messages
- Improved recovery from network errors and authentication failures

### 3. More Reliable Storage

- Enhanced cross-platform storage with proper synchronization between AsyncStorage and localStorage
- Better error recovery for storage operations
- Clearer naming and organization of storage keys
- Added prefixing for storage keys to prevent conflicts on web

### 4. Enhanced Token Management

- More robust token refreshing with debouncing to prevent excessive refresh attempts
- Better validation of authentication responses
- Improved handling of token expiration
- Added retry logic for API requests that fail due to expired tokens

### 5. Navigation Improvements

- Centralized navigation logic in AuthContext
- Added small delays before navigation to prevent race conditions
- Better handling of platform-specific navigation concerns
- More consistent loading indicators during navigation

### 6. Better Accessibility

- Added proper accessibility attributes throughout the app
- Improved test IDs for easier automated testing
- Better loading indicators with descriptive text

## Files Changed

1. `app/context/AuthContext.tsx` - Complete rewrite of authentication state management
2. `app/components/AuthGuard.tsx` - Improved component for protecting routes
3. `app/_layout.tsx` - Enhanced root layout with better navigation guards
4. `app/screens/auth/login.tsx` - Improved login screen with better validation
5. `app/utils/storage.ts` - Enhanced storage utilities for cross-platform consistency
6. `app/utils/tokenUtils.ts` - Better token management utilities
7. `app/utils/tokenRefresher.ts` - Improved token refresh mechanism with debouncing
8. `app/services/api.ts` - Enhanced API service with retry logic and better error handling
9. `app/(tabs)/settings.tsx` - Improved logout handling in settings screen

## How to Test

1. **Login Flow**:
   - Try logging in with valid credentials
   - Try logging in with invalid credentials
   - Verify that appropriate error messages are shown
   - Check that navigation to the home screen works properly after successful login

2. **Logout Flow**:
   - Go to Settings and click "Sign Out"
   - Verify that you're redirected to the login screen
   - Try to access protected routes after logout
   - Verify you can't access protected routes without authentication

3. **Token Refresh**:
   - Login with valid credentials
   - Wait for the token to approach expiration
   - Perform an action that requires authentication
   - Verify that the token is refreshed and the action succeeds

4. **Error Recovery**:
   - Test with network disconnected
   - Verify appropriate error messages
   - Reconnect and verify recovery

5. **Cross-Platform Testing**:
   - Test on iOS and Android devices
   - Test on web browsers
   - Verify consistent behavior across platforms

## Implementation Notes

### Authentication State Management

The new authentication system uses a reducer pattern to manage state transitions, making the code more maintainable and the behavior more predictable. The state machine ensures that only valid state transitions can occur.

```typescript
// Example of how the state machine works
function authReducer(state: AuthStateInterface, action: AuthAction): AuthStateInterface {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        authState: AuthState.INITIALIZING,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        authState: action.payload.user.isPendingApproval
          ? AuthState.PENDING_APPROVAL
          : AuthState.AUTHENTICATED,
        error: null
      };
    // ... other cases
  }
}
```

### Navigation Control

Navigation is now centralized in a useEffect hook in AuthContext that responds to authentication state changes:

```typescript
useEffect(() => {
  // Skip navigation during initial loading
  if (isLoading) return;

  const handleNavigation = async () => {
    try {
      if (state.authState === AuthState.AUTHENTICATED) {
        // Small delay to ensure state updates before navigation
        await new Promise(resolve => setTimeout(resolve, 50));
        router.replace('/(tabs)/index');
      } else if (state.authState === AuthState.UNAUTHENTICATED) {
        // ... handle unauthenticated state
      }
    } catch (error) {
      // ... handle error
    }
  };

  handleNavigation();
}, [state.authState, isLoading]);
```

This approach ensures that navigation happens consistently based on authentication state.

## Future Improvements

1. Add unit tests specifically for authentication flows
2. Implement token rotation for enhanced security
3. Add support for social authentication providers
4. Enhance deep linking support with authentication checks
5. Add biometric authentication for native platforms

## Conclusion

These refactoring changes significantly improve the reliability and user experience of the authentication and navigation system in the Armatillo app. The code is now more maintainable, errors are handled better, and the behavior is more consistent across platforms.
