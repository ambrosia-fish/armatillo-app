import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { 
  storeAuthTokens, 
  isTokenExpired, 
  getTokenTimeRemaining, 
  clearAuthTokens,
  validateToken,
  blacklistToken,
  reportCompromisedToken
} from '../utils/tokenUtils';
import {
  generateOAuthState,
  verifyOAuthState,
  SECURITY_KEYS
} from '../utils/securityUtils';

// Import mock PKCE implementation for testing
import mockPKCE from '../utils/mockPKCE';

// Define the type for user data
interface User {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

// Define the auth context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleOAuthCallback: (url: string) => Promise<void>;
  refreshTokenIfNeeded: () => Promise<boolean>;
  reportSuspiciousActivity: (reason: string) => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

// API URLs for different environments
const getApiUrl = () => {
  if (__DEV__) {
    // Use ngrok URL for development
    return 'http://192.168.0.101:3000';
  }
  return 'https://api.armatillo.com';
};

// API URL
const API_URL = getApiUrl();

// Token refresh timeout reference
let tokenRefreshTimeout: NodeJS.Timeout | null = null;

// Max consecutive authentication failures before triggering security measures
const MAX_AUTH_FAILURES = 3;

// Counter for consecutive authentication failures
let authFailureCount = 0;

// Flag to bypass regular OAuth in development mode
const BYPASS_AUTH_IN_DEV = __DEV__;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inProgress, setInProgress] = useState(false);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Set up a listener for URL events (deep linking)
  useEffect(() => {
    // Define our callback function to handle the URL
    const handleUrl = (event: { url: string }) => {
      if (inProgress && event.url.includes('auth/callback')) {
        console.log('Received callback URL:', event.url);
        handleAuthResponse(event.url);
      }
    };

    // Add the event listener
    const subscription = Linking.addEventListener('url', handleUrl);

    // Remove the listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, [inProgress]);

  // Clean up token refresh timeout on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
    };
  }, []);

  // Automatically attempt dev login in development mode
  useEffect(() => {
    const autoDevLogin = async () => {
      if (BYPASS_AUTH_IN_DEV && !isAuthenticated && !token && !user) {
        console.log('Development mode: Auto-logging in with dev credentials');
        try {
          await devLogin();
        } catch (error) {
          console.error('Auto dev login failed:', error);
          // Create mock user if the backend isn't running
          console.log('Creating mock user for development');
          const mockUser = {
            id: 'dev-user-id',
            email: 'dev@example.com',
            displayName: 'Development User',
            firstName: 'Dev',
            lastName: 'User',
          };
          setUser(mockUser);
          setToken('mock-dev-token');
          await storage.setObject(STORAGE_KEYS.USER, mockUser);
          await storage.setItem(STORAGE_KEYS.USER_NAME, mockUser.displayName);
          setIsLoading(false);
          // Navigate to home screen
          router.replace('/(tabs)');
        }
      }
    };

    // If no stored credentials are found, try auto dev login
    const checkAndLogin = async () => {
      // First check for existing stored credentials
      await loadAuthState();
      
      // If still not authenticated, try dev login
      if (BYPASS_AUTH_IN_DEV && !isAuthenticated && !token && !user) {
        await autoDevLogin();
      }
    };

    checkAndLogin();
  }, []);

  // Load the user's authentication state on app start
  const loadAuthState = async () => {
    try {
      // Load token from storage
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      
      // Load user data from storage
      const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        // Validate the token (signature verification + blacklist check)
        const isTokenValid = await validateToken(storedToken);
        
        if (!isTokenValid) {
          console.log('Token validation failed - invalid signature or blacklisted');
          await clearAuthState();
          return;
        }
        
        // Check if token is expired or about to expire
        if (await isTokenExpired()) {
          console.log('Token expired on app start, attempting refresh');
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Refresh failed, clear auth state and redirect to login
            await clearAuthState();
            return;
          }
        } else {
          // Token is valid, set it
          setToken(storedToken);
          
          // Schedule token refresh before it expires
          scheduleTokenRefresh();
        }
        
        // Set user data
        setUser(storedUser);
        
        // Store user display name separately for easier access
        if (storedUser.displayName) {
          await storage.setItem(STORAGE_KEYS.USER_NAME, storedUser.displayName);
        }
      }
    } catch (error) {
      console.error('Failed to load authentication state:', error);
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule token refresh before it expires
  const scheduleTokenRefresh = async () => {
    try {
      // Clear any existing timeout
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      
      // Get time remaining until token expires
      const timeRemaining = await getTokenTimeRemaining();
      
      if (timeRemaining <= 0) {
        // Token already expired, refresh now
        refreshToken();
        return;
      }
      
      // Schedule refresh for 1 minute before expiration or at half of the remaining time,
      // whichever is sooner (but at least 5 seconds before expiry)
      const refreshTime = Math.min(
        timeRemaining - 60000, // 1 minute before expiry
        timeRemaining / 2      // Half of remaining time
      );
      const refreshDelay = Math.max(refreshTime, 5000); // At least 5 seconds before expiry
      
      console.log(`Scheduling token refresh in ${refreshDelay / 1000} seconds`);
      
      tokenRefreshTimeout = setTimeout(async () => {
        console.log('Executing scheduled token refresh');
        await refreshToken();
      }, refreshDelay);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  };

  // Clear authentication state
  const clearAuthState = async () => {
    try {
      console.log('Clearing authentication state...');
      
      // Use the storage.clear() method to clean everything
      await storage.clear();
      
      // Update state
      setToken(null);
      setUser(null);
      
      // Clear token refresh timeout
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
        tokenRefreshTimeout = null;
      }
      
      console.log('Authentication state cleared successfully');
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Refresh the access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh token');
      
      // Get refresh token
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }
      
      // Call refresh token endpoint
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        console.error('Failed to refresh token:', await response.text());
        
        // If server rejects the refresh token, it might be compromised
        if (response.status === 401) {
          // Blacklist this refresh token
          console.log('Refresh token rejected by server, possibly compromised');
          await blacklistToken(refreshToken, 'server_rejected_refresh');
        }
        
        return false;
      }
      
      // Parse response
      const data = await response.json();
      
      if (!data.token) {
        console.error('Invalid refresh response:', data);
        return false;
      }
      
      // Store new tokens
      await storeAuthTokens(
        data.token,
        data.expiresIn || undefined,
        data.refreshToken || refreshToken // Use new refresh token if provided, otherwise keep the current one
      );
      
      // Update token state
      setToken(data.token);
      
      // Schedule next refresh
      scheduleTokenRefresh();
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Refresh token if needed (can be called externally)
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    try {
      // Check if token is valid
      const currentToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      if (currentToken) {
        const isValid = await validateToken(currentToken);
        if (!isValid) {
          console.log('Token validation failed, requiring refresh');
          return await refreshToken();
        }
      }
      
      // Check if token is expired or about to expire
      if (await isTokenExpired()) {
        return await refreshToken();
      }
      
      // Token is still valid
      return true;
    } catch (error) {
      console.error('Error in refreshTokenIfNeeded:', error);
      return false;
    }
  };

  // Report suspicious activity (compromised tokens)
  const reportSuspiciousActivity = async (reason: string): Promise<void> => {
    try {
      const currentToken = token;
      if (currentToken) {
        console.log(`Reporting suspicious activity: ${reason}`);
        
        // Blacklist the current token
        await reportCompromisedToken(currentToken, reason);
        
        // Notify the server if possible (in a real app, this would also alert security teams)
        try {
          await fetch(`${API_URL}/api/auth/report-security-event`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              reason,
              tokenFingerprint: await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                currentToken
              )
            }),
          });
        } catch (error) {
          console.error('Failed to notify server of security event:', error);
        }
        
        // Log out user immediately
        await clearAuthState();
        
        // Show alert to user
        Alert.alert(
          'Security Alert',
          'For your safety, you have been logged out due to suspicious activity. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
      
      // Force logout anyway for safety
      await clearAuthState();
      router.replace('/login');
    }
  };

  // Handle the authentication response
  const handleAuthResponse = async (url: string) => {
    try {
      setIsLoading(true);
      
      console.log('Handling OAuth callback URL:', url);
      
      // Extract token and parameters from URL
      // Remove any hash fragments first
      const urlWithoutHash = url.split('#')[0];
      const urlParams = new URLSearchParams(urlWithoutHash.split('?')[1]);
      
      // Check if this is an authorization code flow or token response
      const authCode = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      // Check for errors in the callback
      if (error) {
        console.error(`OAuth error: ${error}: ${errorDescription || 'No description'}`);
        throw new Error(`OAuth error: ${error}: ${errorDescription || 'Authentication error'}`);
      }
      
      // For authorization code flow
      if (authCode) {
        console.log('Authorization code received, exchanging for tokens...');
        
        // Verify the state parameter to prevent CSRF attacks
        if (!state) {
          console.error('No state parameter in OAuth callback');
          throw new Error('Missing state parameter in OAuth callback');
        }
        
        const isStateValid = await verifyOAuthState(state);
        if (!isStateValid) {
          console.error('OAuth state validation failed, possible CSRF attack');
          
          // Increment auth failure count
          authFailureCount++;
          
          // If too many failures, report suspicious activity
          if (authFailureCount >= MAX_AUTH_FAILURES) {
            await reportSuspiciousActivity('multiple_csrf_validation_failures');
          }
          
          throw new Error('Invalid state parameter in OAuth callback, possible CSRF attack');
        } else {
          console.log('OAuth state validation successful');
          // Reset auth failure count on success
          authFailureCount = 0;
        }
        
        // Get the code verifier that was stored during login
        const codeVerifier = await mockPKCE.getCodeVerifier();
        console.log('Retrieved code verifier from storage:', codeVerifier);
        
        if (!codeVerifier) {
          console.error('No code verifier found in storage');
          throw new Error('Missing PKCE code verifier');
        }
        
        // Exchange the authorization code for tokens using PKCE
        console.log('Exchanging authorization code for tokens using PKCE...');
        console.log('Token request data:', {
          grant_type: 'authorization_code',
          code: authCode,
          code_verifier: codeVerifier,
          redirect_uri: 'armatillo://auth/callback'
        });
        
        const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code: authCode,
            code_verifier: codeVerifier,
            redirect_uri: 'armatillo://auth/callback'
          })
        });
        
        // Log the raw response for debugging
        const tokenResponseText = await tokenResponse.text();
        console.log('Token response status:', tokenResponse.status);
        console.log('Token response:', tokenResponseText);
        
        if (!tokenResponse.ok) {
          console.error('Token exchange failed:', tokenResponseText);
          
          // Increment auth failure count
          authFailureCount++;
          
          throw new Error(`Failed to exchange code for token: ${tokenResponse.status} ${tokenResponseText}`);
        }
        
        // Parse token response
        let tokenData;
        try {
          tokenData = JSON.parse(tokenResponseText);
        } catch (e) {
          console.error('Failed to parse token response as JSON:', e);
          throw new Error('Invalid token response format');
        }
        
        // Clear code verifier after use
        await mockPKCE.clearCodeVerifier();
        
        // Process the token response
        const newToken = tokenData.access_token || tokenData.token;
        const expiresIn = tokenData.expires_in || tokenData.expiresIn;
        const refreshToken = tokenData.refresh_token || tokenData.refreshToken;
        
        if (!newToken) {
          throw new Error('No token received from authorization code exchange');
        }
        
        console.log('Token received from authorization code exchange');
        
        // Continue with token processing
        await processReceivedToken(newToken, expiresIn, refreshToken);
      } else {
        // Legacy direct token flow (fallback)
        const newToken = urlParams.get('token');
        const expiresIn = urlParams.get('expires_in');
        const refreshToken = urlParams.get('refresh_token');
        
        // Verify the state parameter to prevent CSRF attacks
        if (!state) {
          console.error('No state parameter in OAuth callback');
          throw new Error('Missing state parameter in OAuth callback');
        }
        
        const isStateValid = await verifyOAuthState(state);
        if (!isStateValid) {
          console.error('OAuth state validation failed, possible CSRF attack');
          
          // Increment auth failure count
          authFailureCount++;
          
          // If too many failures, report suspicious activity
          if (authFailureCount >= MAX_AUTH_FAILURES) {
            await reportSuspiciousActivity('multiple_csrf_validation_failures');
          }
          
          throw new Error('Invalid state parameter in OAuth callback, possible CSRF attack');
        } else {
          console.log('OAuth state validation successful');
          // Reset auth failure count on success
          authFailureCount = 0;
        }
        
        if (!newToken) {
          throw new Error('No token received from authentication');
        }
        
        console.log('Token received directly in URL params');
        
        // Continue with token processing
        await processReceivedToken(newToken, expiresIn, refreshToken);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      Alert.alert('Authentication Failed', 'Failed to complete the login process. Please try again.');
    } finally {
      setIsLoading(false);
      setInProgress(false);
    }
  };
  
  // Process received token (common code for both flows)
  const processReceivedToken = async (
    newToken: string,
    expiresIn: string | null,
    refreshToken: string | null
  ) => {
    try {
      // Store tokens with expiration
      await storeAuthTokens(
        newToken,
        expiresIn ? parseInt(expiresIn, 10) : undefined,
        refreshToken || undefined
      );
      
      // Update state
      setToken(newToken);
      
      // Schedule token refresh
      scheduleTokenRefresh();
      
      // Fetch user data with the token
      console.log('Fetching user data from API');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', errorText);
        
        // If unauthorized, the token might be compromised
        if (response.status === 401) {
          await blacklistToken(newToken, 'unauthorized_user_fetch');
        }
        
        throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
      }
      
      const rawResponse = await response.text();
      console.log('Raw API response:', rawResponse);
      
      let userData;
      try {
        userData = JSON.parse(rawResponse);
        console.log('Parsed user data:', JSON.stringify(userData));
      } catch (parseError) {
        console.error('Failed to parse user data JSON:', parseError);
        throw new Error('Invalid JSON in user data response');
      }
      
      // Validate the user data structure
      if (!userData) {
        throw new Error('Empty response from API');
      }
      
      // The API returns the user object directly, not wrapped in a 'user' property
      const userObj = userData.user || userData; // Try both formats for backward compatibility
      
      // Validate required user properties
      if (!userObj.id) {
        console.error('User data missing id:', userObj);
        throw new Error('User data missing required id field');
      }
      
      if (!userObj.email) {
        console.error('User data missing email:', userObj);
        throw new Error('User data missing required email field');
      }
      
      if (!userObj.displayName) {
        // If displayName is missing, create one from email or set a default
        userObj.displayName = userObj.email.split('@')[0] || 'Armatillo User';
        console.log('Created display name:', userObj.displayName);
      }
      
      console.log('User data validation passed');
      
      // Save user data to storage - ensure it's a valid object before storing
      try {
        // Store user data as a stringified object
        await storage.setObject(STORAGE_KEYS.USER, userObj);
        setUser(userObj);
        
        // Store user display name separately for easier access
        await storage.setItem(STORAGE_KEYS.USER_NAME, userObj.displayName);
        console.log('User display name stored:', userObj.displayName);
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        throw new Error('Failed to store user data securely');
      }
      
      // Navigate to home screen
      console.log('Authentication complete, navigating to home');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error processing token:', error);
      throw error;
    }
  };

  // Function to use the development login endpoint
  const devLogin = async (): Promise<boolean> => {
    try {
      console.log('Development mode: Using dev-login endpoint');
      setIsLoading(true);
      
      // Call the development login endpoint to get real tokens
      const response = await fetch(`${API_URL}/api/auth/dev-login`);
      
      if (!response.ok) {
        console.error('Dev login failed:', await response.text());
        throw new Error('Dev login failed');
      }
      
      const data = await response.json();
      
      if (!data.token || !data.user) {
        console.error('Invalid dev login response:', data);
        throw new Error('Invalid dev login response');
      }
      
      // Store the tokens and user data
      await storeAuthTokens(
        data.token,
        data.expiresIn,
        data.refreshToken
      );
      
      setToken(data.token);
      setUser(data.user);
      
      // Store user data
      await storage.setObject(STORAGE_KEYS.USER, data.user);
      await storage.setItem(STORAGE_KEYS.USER_NAME, data.user.displayName);
      
      // Schedule token refresh if needed
      scheduleTokenRefresh();
      
      console.log('Development login successful');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error using dev login endpoint:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Function to initiate login - with development bypass
  const login = async () => {
    // In development mode with bypass enabled, use the dev-login endpoint
    if (BYPASS_AUTH_IN_DEV) {
      try {
        const success = await devLogin();
        if (success) {
          // Navigate to the main app
          router.replace('/(tabs)');
        } else {
          Alert.alert(
            'Development Login Failed',
            'Failed to use development login. Is the backend running?',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error using dev login endpoint:', error);
        Alert.alert(
          'Development Login Failed',
          'Failed to use development login. Is the backend running?',
          [{ text: 'OK' }]
        );
      }
      return;
    }
    
    // Regular OAuth flow for production or when dev bypass is disabled
    try {
      console.log('Starting login process...');
      setIsLoading(true);
      setInProgress(true);
      
      // First, deeply clean any previous auth sessions
      console.log('Clearing ALL browser sessions and auth data...');
      
      try {
        // Clear all storage
        await storage.clear();
        
        // Clear browser sessions using WebBrowser
        await WebBrowser.warmUpAsync();
        await WebBrowser.coolDownAsync();
        
        // Make sure no lingering OAuth state or PKCE verifier exists
        await storage.removeItem(SECURITY_KEYS.OAUTH_STATE);
        
        console.log('All authentication sessions and data cleared');
      } catch (clearError) {
        console.warn('Error clearing previous sessions:', clearError);
        // Continue anyway
      }
      
      // Generate a state parameter to prevent CSRF attacks
      const state = await generateOAuthState();
      console.log('Generated new OAuth state:', state);
      
      // Generate PKCE challenge using our mock implementation that works with the backend
      const { codeVerifier, codeChallenge } = await mockPKCE.generatePKCEChallenge();
      console.log('Generated PKCE code verifier:', codeVerifier);
      console.log('Generated PKCE code challenge:', codeChallenge);
      
      // Construct the OAuth URL with PKCE and state parameters
      const timestamp = Date.now(); // Add timestamp to prevent caching
      const randomNonce = Math.random().toString(36).substring(2); // Random nonce for uniqueness
      
      // Create a unique custom login URL with required parameters for forced login
      const authUrl = `${API_URL}/api/auth/google-mobile?` + 
        `state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256` +
        `&force_login=true` +
        `&prompt=select_account` +
        `&login_hint=` +
        `&authuser=` +
        `&nonce=${randomNonce}` +
        `&timestamp=${timestamp}` +
        `&use_incognito=true`;
      
      console.log('Opening auth URL with PKCE:', authUrl);
      
      // Use a direct in-app browser instead of WebBrowser.openAuthSessionAsync
      // This gives us more control over the browser session
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'armatillo://auth/callback',
        {
          createTask: true,
          showInRecents: false,
          dismissButtonStyle: 'close',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          preferEphemeralSession: true // Use ephemeral/incognito mode if available
        }
      );
      
      console.log('Auth session result:', result);
      
      if (result.type === 'success' && result.url) {
        await handleAuthResponse(result.url);
      } else {
        // User cancelled or flow was interrupted
        console.log('Auth flow interrupted or cancelled');
        setIsLoading(false);
        setInProgress(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setInProgress(false);
      Alert.alert('Login Failed', 'Failed to authenticate with Google. Please try again.');
    } finally {
      // Clean up browser sessions
      try {
        await WebBrowser.coolDownAsync();
      } catch (error) {
        console.warn('Error cleaning up browser sessions:', error);
      }
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      console.log('Starting complete logout process...');
      setIsLoading(true);
      
      // Get token for logout request
      const currentToken = token;
      
      // First, try to call the API to invalidate the session server-side
      if (currentToken) {
        try {
          console.log('Calling logout API endpoint...');
          const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          
          if (response.ok) {
            console.log('Server-side logout successful');
          } else {
            console.warn('Server-side logout returned error:', await response.text());
          }
        } catch (error) {
          console.warn('Error calling logout endpoint:', error);
          // Continue with local logout even if the API call fails
        }
      }
      
      // Then, clear all local auth data
      console.log('Clearing all local auth data...');
      await clearAuthState();
      
      // Also clear any browser sessions 
      try {
        await WebBrowser.warmUpAsync();
        await WebBrowser.coolDownAsync();
        console.log('Browser sessions cleared');
      } catch (browserError) {
        console.warn('Failed to clear browser sessions:', browserError);
      }
      
      // Finally, navigate to login screen
      console.log('Complete logout process finished, navigating to login screen');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    handleOAuthCallback: handleAuthResponse,
    refreshTokenIfNeeded,
    reportSuspiciousActivity
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Create a default export
const Auth = {
  AuthProvider,
  useAuth
};

export default Auth;
