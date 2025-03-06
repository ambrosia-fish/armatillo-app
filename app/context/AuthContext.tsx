import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import storage, { STORAGE_KEYS } from '../utils/storage';

// Register for the auth callback
WebBrowser.maybeCompleteAuthSession();

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

// Google Expo auth configuration
const GOOGLE_CLIENT_ID = '825926621030-0a8jnp22pfk1ehejp04pap3q21a4emlu.apps.googleusercontent.com'; // Use your actual Client ID
const GOOGLE_EXPO_CLIENT_ID = '825926621030-0a8jnp22pfk1ehejp04pap3q21a4emlu.apps.googleusercontent.com'; // Use your iOS Client ID for Expo
const GOOGLE_ANDROID_CLIENT_ID = '825926621030-0a8jnp22pfk1ehejp04pap3q21a4emlu.apps.googleusercontent.com'; // Use your Android Client ID

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_EXPO_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
    responseType: 'code',
  });

  // Handle the response from Google Auth
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        setIsLoading(true);
        const { code } = response.params;
        
        try {
          console.log('Got authorization code from Google:', code);
          
          // Exchange the authorization code for tokens with your backend
          const tokenResponse = await fetch(`${API_URL}/auth/google-token-exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            throw new Error('Failed to exchange authorization code for token');
          }
          
          const data = await tokenResponse.json();
          const newToken = data.token;
          
          // Save token to storage
          await storage.setItem(STORAGE_KEYS.TOKEN, newToken);
          setToken(newToken);
          
          // Fetch user data with the token
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
          
          if (!userResponse.ok) {
            console.error('Failed to fetch user data');
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await userResponse.json();
          
          // Save user data to storage
          await storage.setObject(STORAGE_KEYS.USER, userData.user);
          setUser(userData.user);
          
          // Navigate to home screen
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Authentication error:', error);
          Alert.alert('Authentication Failed', 'Failed to complete the login process. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Google authentication error:', response.error);
        Alert.alert('Authentication Failed', response.error?.message || 'Failed to authenticate with Google');
        setIsLoading(false);
      }
    };
    
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

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
      
      if (!request) {
        throw new Error('Google Auth request object is not ready');
      }
      
      console.log('Starting Google authentication flow');
      
      // The Expo AuthSession handles browser opening and redirect automatically
      await promptAsync();
      
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      Alert.alert('Login Failed', 'Failed to start authentication process. Please try again.');
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
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Error calling logout endpoint:', error);
        // Continue with local logout even if the API call fails
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
