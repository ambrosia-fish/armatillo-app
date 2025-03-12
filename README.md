# Armatillo App

Mobile app for tracking BFRB (Body-Focused Repetitive Behaviors) habits during habit reversal training.

## OAuth Authentication Setup

This application uses Google OAuth for authentication. Follow these steps to set up and test the authentication flow:

### Development Mode - OAuth Bypass

When running the app in development mode, OAuth authentication is automatically bypassed to make local development easier. The approach uses a special dev-login endpoint on the backend that:

1. Creates/retrieves a development user account
2. Generates real tokens for this user
3. Returns these tokens to the app without requiring any OAuth login

This approach has several benefits for development:
- Uses real tokens that work with all API endpoints
- Preserves the normal authentication flow
- Doesn't require code changes when deploying to production

#### How it works

The authentication bypass consists of two parts:

1. **Backend** (armatillo-api):
   - A development-only route (`/api/auth/dev-login`) is exposed only when `NODE_ENV=development`
   - This endpoint creates a standard development user account if it doesn't exist
   - It generates valid tokens and returns them just like a real login would

2. **Frontend** (armatillo-app):
   - When in development mode (`__DEV__` is true), the login flow is modified
   - Instead of opening the OAuth browser, it calls the dev-login endpoint
   - The received tokens are stored and used exactly as they would be after a normal login

#### Disabling the Development Bypass

If you need to test the actual OAuth flow in development:

1. In the frontend app (armatillo-app), open `app/context/AuthContext.tsx` and change:
   ```typescript
   const BYPASS_AUTH_IN_DEV = __DEV__;
   ```
   to:
   ```typescript
   const BYPASS_AUTH_IN_DEV = false;
   ```

2. You can also selectively disable just the backend part by not setting `NODE_ENV=development` when running the API server.

### Backend Configuration (armatillo-api)

1. Create a Google OAuth Client ID and Secret in the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Set Application Type to "Web application"
   - Add Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
   - Save your Client ID and Client Secret

2. Update your .env file in the armatillo-api project:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bfrb-tracker
   FRONTEND_URL=http://localhost:3000
   API_URL=http://localhost:5000

   # OAuth 
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

### Frontend Configuration (armatillo-app)

1. Update the API URL in `app/context/AuthContext.tsx` to point to your local backend:
   ```typescript
   const getApiUrl = () => {
     if (__DEV__) {
       // Use your local API URL for development
       return 'http://192.168.0.101:5000';
     }
     return 'https://api.armatillo.com';
   };
   ```

2. Configure your Expo development build to handle custom URI schemes:
   - Ensure your app.json has the correct scheme:
     ```json
     {
       "expo": {
         "scheme": "armatillo"
       }
     }
     ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Security Features

This application implements several security best practices:

1. **Secure Token Storage**: Authentication tokens and user data are stored using Expo SecureStore, which uses the Keychain (iOS) and KeyStore (Android) for encrypted storage, protecting sensitive data even on compromised devices.

2. **Token Expiration Handling**: The app automatically tracks token expiration and refreshes tokens before they expire, ensuring a seamless user experience and maintaining security.

3. **Proactive Token Refresh**: Instead of waiting for tokens to expire and cause failed API requests, the app proactively refreshes tokens before they expire.

4. **API Error Recovery**: If an API request fails due to an expired token, the app automatically attempts to refresh the token and retry the request, providing a seamless experience for users.

5. **CSRF Protection**: The authentication flow implements state parameters to prevent Cross-Site Request Forgery attacks, ensuring that authentication requests originate from the app and not from malicious sources.

6. **OAuth Flow Protection**: The authentication flow utilizes proper URL handling and token management to prevent common authentication attacks.

### Testing the OAuth Flow

1. Start the backend:
   ```bash
   cd armatillo-api
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd armatillo-app
   npx expo start
   ```

3. Open the app in your Expo Go client or simulator
4. If in development mode, you'll be automatically logged in with the development user account
5. If in production mode (or with bypass disabled), tap "Continue with Google" and complete the OAuth flow

## Troubleshooting

If you encounter issues with the OAuth flow:

- Check that your backend is running and accessible from your device/simulator
- Verify that the redirect URI matches exactly in both Google Cloud Console and your backend config
- Check for any CORS issues if testing on a physical device
- Make sure you're using the correct API URL in the app's `getApiUrl()` function
- Check the JWT and session secrets are properly set
- Inspect logs on both backend and frontend for specific error messages

If the development bypass isn't working:
- Ensure the API is running with `NODE_ENV=development`
- Check that the backend URL in the app is correct and reachable
- Verify network connectivity between the app and your API

## Development

This project uses React Native with Expo and follows the Expo Router file-based navigation system.

- `/app` - Contains all screens and navigation structure
- `/app/context` - React context providers for state management
- `/app/services` - API service for backend communication
- `/app/components` - Reusable UI components
- `/app/utils` - Utility functions including token management and security utilities
