# Armatillo App

Mobile app for tracking BFRB (Body-Focused Repetitive Behaviors) habits during habit reversal training.

## OAuth Authentication Setup

This application uses Google OAuth for authentication. Follow these steps to set up and test the authentication flow:

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

   # OAuth 
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

### Frontend Configuration (armatillo-app)

1. Update the API URL in `app/services/api.ts` to point to your local backend:
   ```typescript
   const API_URL = 'http://192.168.0.101:3000/api'; // Replace with your API URL
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
4. You should be redirected to the login screen
5. Tap "Continue with Google"
6. Complete the Google OAuth flow
7. You should be redirected back to the app and logged in

## Troubleshooting

If you encounter issues with the OAuth flow:

- Check that your backend is running and accessible from your device/simulator
- Verify that the redirect URI matches exactly in both Google Cloud Console and your backend config
- Check for any CORS issues if testing on a physical device
- Make sure you're using the correct API URL in `app/services/api.ts`
- Check the JWT and session secrets are properly set
- Inspect logs on both backend and frontend for specific error messages

## Development

This project uses React Native with Expo and follows the Expo Router file-based navigation system.

- `/app` - Contains all screens and navigation structure
- `/app/context` - React context providers for state management
- `/app/services` - API service for backend communication
- `/app/components` - Reusable UI components
