import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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
import { API_URL, handlePendingResponse } from '../utils/testUserUtils';

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
      if (inProgress) {
        // Check specific routes
        if (event.url.includes('auth/callback')) {
          console.log('Received callback URL:', event.url);
          handleAuthResponse(event.url);
        } else if (event.url.includes('auth/pending')) {
          console.log('Received pending URL:', event.url);
          handlePendingResponse(event.url);
          setInProgress(false);
          setIsLoading(false);
        }
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

  // Auto-login for development
  useEffect(() => {
    const checkAndLogin = async () => {
      await loadAuthState();
      
      if (BYPASS_AUTH_IN_DEV && !isAuthenticated && !token && !user) {
        await devLogin();
      }
    };

    checkAndLogin();
  }, []);

  // Load the user's authentication state on app start
  const loadAuthState = async () => {
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        if (!await validateToken(storedToken)) {
          await clearAuthState();
          return;
        }
        
        if (await isTokenExpired()) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            await clearAuthState();
            return;
          }
        } else {
          setToken(storedToken);
          scheduleTokenRefresh();
        }
        
        setUser(storedUser);
        
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
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      
      const timeRemaining = await getTokenTimeRemaining();
      
      if (timeRemaining <= 0) {
        refreshToken();
        return;
      }
      
      const refreshTime = Math.min(
        timeRemaining - 60000, // 1 minute before expiry
        timeRemaining / 2      // Half of remaining time
      );
      const refreshDelay = Math.max(refreshTime, 5000); // At least 5 seconds before expiry
      
      tokenRefreshTimeout = setTimeout(async () => {
        await refreshToken();
      }, refreshDelay);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  };

  // Clear authentication state
  const clearAuthState = async () => {
    try {
      await storage.clear();
      setToken(null);
      setUser(null);
      
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
        tokenRefreshTimeout = null;
      }
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Refresh the access token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) return false;
      
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await blacklistToken(refreshToken, 'server_rejected_refresh');
        }
        return false;
      }
      
      const data = await response.json();
      
      if (!data.token) return false;
      
      await storeAuthTokens(
        data.token,
        data.expiresIn || undefined,
        data.refreshToken || refreshToken
      );
      
      setToken(data.token);
      scheduleTokenRefresh();
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Refresh token if needed (can be called externally)
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    try {
      const currentToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      if (currentToken) {
        if (!await validateToken(currentToken)) {
          return await refreshToken();
        }
      }
      
      if (await isTokenExpired()) {
        return await refreshToken();
      }
      
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
        await reportCompromisedToken(currentToken, reason);
        
        try {
          await fetch(`${API_URL}/api/auth/report-security-event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        
        await clearAuthState();
        
        Alert.alert(
          'Security Alert',
          'For your safety, you have been logged out due to suspicious activity. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
      await clearAuthState();
      router.replace('/login');
    }
  };

  // Handle the authentication response
  const handleAuthResponse = async (url: string) => {
    try {
      setIsLoading(true);
      
      const urlWithoutHash = url.split('#')[0];
      const urlParams = new URLSearchParams(urlWithoutHash.split('?')[1]);
      
      const authCode = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        throw new Error(`OAuth error: ${error}: ${errorDescription || 'Authentication error'}`);
      }
      
      // Process token based on authorization flow
      if (authCode) {
        // Authorization code flow (PKCE)
        if (!state) {
          throw new Error('Missing state parameter in OAuth callback');
        }
        
        const isStateValid = await verifyOAuthState(state);
        if (!isStateValid) {
          authFailureCount++;
          
          if (authFailureCount >= MAX_AUTH_FAILURES) {
            await reportSuspiciousActivity('multiple_csrf_validation_failures');
          }
          
          throw new Error('Invalid state parameter in OAuth callback');
        } else {
          authFailureCount = 0;
        }
        
        const codeVerifier = await mockPKCE.getCodeVerifier();
        if (!codeVerifier) {
          throw new Error('Missing PKCE code verifier');
        }
        
        const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code: authCode,
            code_verifier: codeVerifier,
            redirect_uri: 'armatillo://auth/callback'
          })
        });
        
        if (!tokenResponse.ok) {
          authFailureCount++;
          throw new Error(`Failed to exchange code for token: ${await tokenResponse.text()}`);
        }
        
        const tokenData = await tokenResponse.json();
        await mockPKCE.clearCodeVerifier();
        
        const newToken = tokenData.access_token || tokenData.token;
        const expiresIn = tokenData.expires_in || tokenData.expiresIn;
        const refreshToken = tokenData.refresh_token || tokenData.refreshToken;
        
        if (!newToken) {
          throw new Error('No token received from authorization code exchange');
        }
        
        await processReceivedToken(newToken, expiresIn, refreshToken);
      } else {
        // Legacy direct token flow (fallback)
        const newToken = urlParams.get('token');
        const expiresIn = urlParams.get('expires_in');
        const refreshToken = urlParams.get('refresh_token');
        
        if (!state || !await verifyOAuthState(state)) {
          authFailureCount++;
          
          if (authFailureCount >= MAX_AUTH_FAILURES) {
            await reportSuspiciousActivity('multiple_csrf_validation_failures');
          }
          
          throw new Error('Invalid state parameter in OAuth callback');
        } else {
          authFailureCount = 0;
        }
        
        if (!newToken) {
          throw new Error('No token received from authentication');
        }
        
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
      await storeAuthTokens(
        newToken,
        expiresIn ? parseInt(expiresIn, 10) : undefined,
        refreshToken || undefined
      );
      
      setToken(newToken);
      scheduleTokenRefresh();
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await blacklistToken(newToken, 'unauthorized_user_fetch');
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const userData = await response.json();
      
      if (!userData) {
        throw new Error('Empty response from API');
      }
      
      const userObj = userData.user || userData;
      
      if (!userObj.id || !userObj.email) {
        throw new Error('User data missing required fields');
      }
      
      if (!userObj.displayName) {
        userObj.displayName = userObj.email.split('@')[0] || 'Armatillo User';
      }
      
      await storage.setObject(STORAGE_KEYS.USER, userObj);
      setUser(userObj);
      await storage.setItem(STORAGE_KEYS.USER_NAME, userObj.displayName);
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error processing token:', error);
      throw error;
    }
  };

  // Function to use the development login endpoint
  const devLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/dev-login`);
      
      if (!response.ok) {
        console.error('Dev login failed:', await response.text());
        return false;
      }
      
      const data = await response.json();
      
      if (!data.token || !data.user) {
        return false;
      }
      
      await storeAuthTokens(
        data.token,
        data.expiresIn,
        data.refreshToken
      );
      
      setToken(data.token);
      setUser(data.user);
      
      await storage.setObject(STORAGE_KEYS.USER, data.user);
      await storage.setItem(STORAGE_KEYS.USER_NAME, data.user.displayName);
      
      scheduleTokenRefresh();
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      console.error('Error using dev login endpoint:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to initiate login
  const login = async () => {
    // In development mode with bypass enabled, use the dev-login endpoint
    if (BYPASS_AUTH_IN_DEV) {
      const success = await devLogin();
      if (!success) {
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
      setIsLoading(true);
      setInProgress(true);
      
      // Clear previous sessions
      await storage.clear();
      await WebBrowser.warmUpAsync();
      await WebBrowser.coolDownAsync();
      await storage.removeItem(SECURITY_KEYS.OAUTH_STATE);
      
      // Generate OAuth state and PKCE challenge
      const state = await generateOAuthState();
      const { codeVerifier, codeChallenge } = await mockPKCE.generatePKCEChallenge();
      
      // Create auth URL
      const timestamp = Date.now();
      const randomNonce = Math.random().toString(36).substring(2);
      
      const authUrl = `${API_URL}/api/auth/google-mobile?` + 
        `state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256` +
        `&force_login=true` +
        `&prompt=select_account` +
        `&nonce=${randomNonce}` +
        `&timestamp=${timestamp}` +
        `&use_incognito=true`;
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'armatillo://auth/callback',
        {
          createTask: true,
          showInRecents: false,
          dismissButtonStyle: 'close',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          preferEphemeralSession: true
        }
      );
      
      if (result.type === 'success' && result.url) {
        await handleAuthResponse(result.url);
      } else {
        // User cancelled or flow was interrupted
        setIsLoading(false);
        setInProgress(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setInProgress(false);
      Alert.alert('Login Failed', 'Failed to authenticate with Google. Please try again.');
    } finally {
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
      setIsLoading(true);
      
      // Call server-side logout
      if (token) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.warn('Error calling logout endpoint:', error);
        }
      }
      
      // Clear local state
      await clearAuthState();
      
      // Clear browser sessions
      try {
        await WebBrowser.warmUpAsync();
        await WebBrowser.coolDownAsync();
      } catch (browserError) {
        console.warn('Failed to clear browser sessions:', browserError);
      }
      
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
