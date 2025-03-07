import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Device from 'expo-device';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { 
  storeAuthTokens, 
  isTokenExpired, 
  getTokenTimeRemaining, 
  clearAuthTokens 
} from '../utils/tokenUtils';

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
    return 'https://ba0b-2600-8805-9080-c100-d8b5-4fb6-3bac-1de1.ngrok-free.app';
  }
  return 'https://api.armatillo.com';
};

// API URL
const API_URL = getApiUrl();

// Token refresh timeout reference
let tokenRefreshTimeout: NodeJS.Timeout | null = null;

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

  // Load the user's authentication state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Load token from storage
        const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
        
        // Load user data from storage
        const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          // Check if token is expired or about to expire
          if (await isTokenExpired()) {
            console.log('Token expired on app start, attempting refresh');
            const refreshed = await refreshToken();
            if (!refreshed) {
              // Refresh failed, clear auth state and redirect to login
              await clearAuthState();
              router.replace('/login');
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

    loadAuthState();
  }, []);

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
    // Clear all auth tokens
    await clearAuthTokens();
    
    // Clear user data
    await storage.removeItem(STORAGE_KEYS.USER);
    await storage.removeItem(STORAGE_KEYS.USER_NAME);
    
    // Update state
    setToken(null);
    setUser(null);
    
    // Clear token refresh timeout
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
      tokenRefreshTimeout = null;
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

  // Handle the authentication response
  const handleAuthResponse = async (url: string) => {
    try {
      setIsLoading(true);
      
      console.log('Handling OAuth callback URL:', url);
      
      // Extract token and parameters from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const newToken = urlParams.get('token');
      const expiresIn = urlParams.get('expires_in');
      const refreshToken = urlParams.get('refresh_token');
      
      if (!newToken) {
        throw new Error('No token received from authentication');
      }
      
      console.log('Token received from OAuth callback');
      
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
        console.error('API response not OK:', await response.text());
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      console.log('User data received');
      
      // Save user data to storage
      await storage.setObject(STORAGE_KEYS.USER, userData.user);
      setUser(userData.user);
      
      // Store user display name separately for easier access
      if (userData.user && userData.user.displayName) {
        await storage.setItem(STORAGE_KEYS.USER_NAME, userData.user.displayName);
        console.log('User display name stored:', userData.user.displayName);
      }
      
      // Navigate to home screen
      console.log('Authentication complete, navigating to home');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('OAuth callback error:', error);
      Alert.alert('Authentication Failed', 'Failed to complete the login process. Please try again.');
    } finally {
      setIsLoading(false);
      setInProgress(false);
    }
  };

  // Function to initiate Google OAuth login
  const login = async () => {
    try {
      setIsLoading(true);
      setInProgress(true);
      
      // This performs an important step to handle the Google OAuth correctly
      // It will clear any existing sessions, preventing cached states
      await WebBrowser.warmUpAsync();
      
      // Get device info to use in the OAuth request
      let deviceName = 'Armatillo Device';
      let deviceId = 'armatillo_dev_device';
      
      try {
        // Get device model and brand information
        const model = Device.modelName || 'Unknown Model';
        const brand = Device.brandName || 'Unknown Brand';
        deviceName = `${brand} ${model}`;
        
        // Create a unique device ID using available device info
        deviceId = `${Device.osName}_${Device.osVersion}_${Device.deviceYearClass || '2023'}`;
      } catch (deviceError) {
        console.warn('Could not get device info:', deviceError);
      }
      
      console.log('Using device info:', { deviceId, deviceName });
      
      // Construct the OAuth URL to go directly to Google
      // The URL redirects directly to Google's OAuth page
      const authUrl = `${API_URL}/api/auth/google-mobile`;
      
      console.log('Opening auth URL:', authUrl);
      
      // Open the browser for authentication with proper return URL
      const redirectUrl = 'armatillo://auth/callback';
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
        {
          // Prevent reusing previous session
          createTask: true,
          showInRecents: false
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
      await WebBrowser.coolDownAsync();
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Get token for logout request
      const currentToken = token;
      
      // Clear auth state (tokens and user data)
      await clearAuthState();
      
      // Call API to invalidate session
      if (currentToken) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
        } catch (error) {
          console.warn('Error calling logout endpoint:', error);
          // Continue with local logout even if the API call fails
        }
      }
      
      // Navigate to login
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
