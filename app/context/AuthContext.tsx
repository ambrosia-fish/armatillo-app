import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import { API_URL } from '../services/api';

// User data type
interface User {
  id: string;
  email: string;
  displayName: string;
}

// Auth context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleOAuthCallback: (url: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inProgress, setInProgress] = useState(false);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Set up deep linking listener
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      if (inProgress && event.url.includes('auth/callback')) {
        handleAuthResponse(event.url);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // Check web URL for callback
    if (Platform.OS === 'web') {
      const url = window.location.href;
      if (url.includes('auth/callback')) {
        handleAuthResponse(url);
      }
    }

    return () => subscription.remove();
  }, [inProgress]);

  // Load auth state on start
  useEffect(() => {
    loadAuthState();
  }, []);

  // Load auth state from storage
  const loadAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUserJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  // Clear auth state
  const clearAuthState = async () => {
    try {
      await clearAuthTokens();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Process token and user data
  const processAuthData = async (
    newToken: string,
    expiresIn: string | null,
    refreshToken: string | null
  ) => {
    try {
      // Store tokens
      const expiresInNum = expiresIn ? parseInt(expiresIn, 10) : undefined;
      await storeAuthTokens(newToken, expiresInNum, refreshToken || undefined);
      setToken(newToken);
      
      // Fetch user info
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      const userData = await response.json();
      const userObj = userData.user || userData;
      
      if (!userObj.displayName) {
        userObj.displayName = userObj.email.split('@')[0] || 'User';
      }
      
      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
      setUser(userObj);
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error processing auth data:', error);
      throw error;
    }
  };

  // Handle OAuth callback URL
  const handleAuthResponse = async (url: string) => {
    try {
      setIsLoading(true);
      
      // Extract parameters from URL
      let token, expiresIn, refreshToken;
      const params = Platform.OS === 'web' 
        ? new URL(url).searchParams
        : new URLSearchParams(url.split('?')[1]);
      
      token = params.get('token');
      expiresIn = params.get('expires_in');
      refreshToken = params.get('refresh_token');
      
      if (!token) {
        throw new Error('No token received');
      }
      
      await processAuthData(token, expiresIn, refreshToken);
      
      // Clean up URL on web
      if (Platform.OS === 'web') {
        window.history.replaceState({}, document.title, '/');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      Alert.alert('Authentication Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
      setInProgress(false);
    }
  };

  // Initiate login
  const login = async () => {
    try {
      setIsLoading(true);
      setInProgress(true);
      
      // Clear previous session
      await clearAuthState();

      // Create redirect URL
      const redirectUrl = Platform.OS === 'web' 
        ? `${window.location.origin}/auth/callback`
        : 'armatillo://auth/callback';

      // Get OAuth URL
      const response = await fetch(`${API_URL}/api/auth/google-mobile?redirect_uri=${encodeURIComponent(redirectUrl)}`);
      
      if (!response.ok) {
        throw new Error('Failed to start login');
      }
      
      const data = await response.json();
      const authUrl = data.url || data.authUrl;
      
      if (!authUrl) {
        throw new Error('No auth URL provided');
      }
      
      // Handle login based on platform
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          'armatillo://auth/callback'
        );
        
        if (result.type === 'success' && result.url) {
          await handleAuthResponse(result.url);
        } else {
          setIsLoading(false);
          setInProgress(false);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setInProgress(false);
      Alert.alert('Login Failed', 'Please try again.');
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call server logout
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
          console.warn('Logout endpoint error:', error);
        }
      }
      
      // Clear local state
      await clearAuthState();
      
      // Navigate based on platform
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    handleOAuthCallback: handleAuthResponse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default { AuthProvider, useAuth };
