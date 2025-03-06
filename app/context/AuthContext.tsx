import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';

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

// API URL - should be moved to env config
const API_URL = 'http://192.168.0.101:3000/api'; // Replace with your API URL

// Constants for secure storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

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
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
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
      
      // Construct the OAuth URL for Google
      const authUrl = `${API_URL}/auth/google`;
      
      // Open the browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'armatillo://auth/callback'
      );
      
      if (result.type === 'success' && result.url) {
        await handleOAuthCallback(result.url);
      } else {
        // User cancelled or flow was interrupted
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      Alert.alert('Login Failed', 'Failed to authenticate with Google. Please try again.');
    }
  };

  // Function to handle OAuth callback URL
  const handleOAuthCallback = async (url: string) => {
    try {
      setIsLoading(true);
      
      // Extract token from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const newToken = urlParams.get('token');
      
      if (!newToken) {
        throw new Error('No token received from authentication');
      }
      
      // Save token to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);
      
      // Fetch user data with the token
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      
      // Save user data to secure storage
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData.user));
      setUser(userData.user);
      
      // Navigate to home screen
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
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
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
