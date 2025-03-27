import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
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
      console.log('Loading auth state...');
      const storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Stored token found:', storedToken ? 'yes' : 'no');
      
      const storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);
      console.log('Stored user found:', storedUser ? 'yes' : 'no');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        if (storedUser.displayName) {
          await storage.setItem(STORAGE_KEYS.USER_NAME, storedUser.displayName);
        }
      } else {
        console.log('No stored auth credentials found');
      }
    } catch (error) {
      console.error('Failed to load authentication state:', error);
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  // Clear auth state
  const clearAuthState = async () => {
    try {
      console.log('Clearing auth state');
      await clearAuthTokens();
      setToken(null);
      setUser(null);
      console.log('Auth state cleared');
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Process auth response from API
  const processAuthResponse = async (authResponse: any) => {
    try {
      // Make sure we're using the correct structure from the API guide
      // The response structure should match:
      // {
      //   success: true,
      //   token: "access_jwt_token",
      //   refreshToken: "refresh_jwt_token",
      //   expiresIn: 3600,
      //   user: {
      //     id: "user_id",
      //     email: "user@example.com",
      //     displayName: "User Name"
      //   }
      // }
      
      const { success, token, user, expiresIn, refreshToken } = authResponse;
      
      if (!success || !token || !user) {
        throw new Error('Invalid authentication response');
      }
      
      // Store tokens
      await storeAuthTokens(
        token,
        expiresIn || undefined,
        refreshToken || undefined
      );
      
      // Store user data
      await storage.setObject(STORAGE_KEYS.USER, user);
      
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
      
      // Check if registration was successful
      if (response.success) {
        // If the API returns tokens on registration, process them
        if (response.token && response.user) {
          await processAuthResponse(response);
          return response;
        }
        
        // Otherwise, return success and let the user login manually
        Alert.alert('Success', 'Account created successfully! Please log in.');
      }
      
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
        window.location.href = '/screens/auth/login';
      } else {
        router.replace('/screens/auth/login');
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