import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import api from '../services/api';

// User data type
interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
}

// Auth context state
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
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

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

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

  // Process auth response from API
  const processAuthResponse = async (authResponse: any) => {
    try {
      const { token, user, expiresIn, refreshToken } = authResponse;
      
      if (!token || !user) {
        throw new Error('Invalid authentication response');
      }
      
      // Store tokens
      await storeAuthTokens(
        token,
        expiresIn || undefined,
        refreshToken || undefined
      );
      
      // Store user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error processing auth response:', error);
      throw error;
    }
  };

  // Login with username/password
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.auth.login(email, password);
      await processAuthResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await api.auth.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call server logout
      if (token) {
        try {
          await api.auth.logout();
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
    register,
    logout
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
