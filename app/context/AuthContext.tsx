import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
import * as Device from 'expo-device';

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
    // Use IP address from mobile device
    // "localhost" on a phone means the phone itself, not your computer
    return 'http://192.168.0.101:3000/api';
  }
  return 'https://api.armatillo.com/api';
};

// API URL
const API_URL = getApiUrl();

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Load the user's authentication state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Load token from storage
        const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
        
        // Load user data from storage
        const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to load authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Function to initiate Google OAuth login
  const login = async () => {
    try {
      setIsLoading(true);
      
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
      
      console.log('Using device info:', { deviceName, deviceId });
      
      // IMPORTANT: Use the mobile-specific endpoint that uses Google One Tap sign-in
      const authUrl = `${API_URL}/auth/google-mobile`;
      
      console.log('Opening auth URL:', authUrl);
      
      // DEBUGGING - alert the user about the URL we're trying to open
      Alert.alert('Connecting to', authUrl, [
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ]);
      
      // Open the browser for authentication with proper return URL
      const redirectUrl = 'armatillo://auth/callback';
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
        {
          // Prevent reusing previous session
          createTask: true,
          showInRecents: false,
          // Add additional browser options
          browserPackage: Platform.OS === 'android' ? 'com.android.chrome' : undefined,
          prefersEphemeralWebBrowserSession: true,
        }
      );
      
      console.log('Auth session result:', result);
      
      // DEBUGGING - Show the result
      Alert.alert('Result type', `${result.type}`);
      
      if (result.type === 'success' && result.url) {
        await handleOAuthCallback(result.url);
      } else {
        // User cancelled or flow was interrupted
        console.log('Auth flow interrupted or cancelled');
        Alert.alert('Sign-in cancelled', 'Authentication was cancelled or interrupted.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      Alert.alert('Login Failed', 'Failed to authenticate with Google. Please try again.\n\nError: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      // Clean up browser sessions
      await WebBrowser.coolDownAsync();
    }
  };

  // Function to handle OAuth callback URL
  const handleOAuthCallback = async (url: string) => {
    try {
      setIsLoading(true);
      
      console.log('Handling OAuth callback URL:', url);
      
      // Extract token from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const newToken = urlParams.get('token');
      
      if (!newToken) {
        throw new Error('No token received from authentication');
      }
      
      console.log('Token received from OAuth callback');
      
      // Save token to storage
      await storage.setItem(STORAGE_KEYS.TOKEN, newToken);
      setToken(newToken);
      
      // Fetch user data with the token
      console.log('Fetching user data from API');
      const response = await fetch(`${API_URL}/auth/me`, {
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
      
      // Navigate to home screen
      console.log('Authentication complete, navigating to home');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('OAuth callback error:', error);
      Alert.alert('Authentication Failed', 'Failed to complete the login process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored data
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.TOKEN),
        storage.removeItem(STORAGE_KEYS.USER),
      ]);
      
      // Reset state
      setToken(null);
      setUser(null);
      
      // Call API to invalidate session
      await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
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
    handleOAuthCallback,
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
