import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import api from '../services/api';
import { errorService } from '../services/ErrorService';

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
  refreshAuth: () => Promise<boolean>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

// Helper to detect if app is running in standalone mode (PWA)
const isRunningAsStandalone = () => {
  if (Platform.OS !== 'web') return false;
  
  // Check if running in PWA standalone mode
  if (typeof window !== 'undefined') {
    return window.matchMedia('(display-mode: standalone)').matches || 
           ('standalone' in window.navigator && (window.navigator as any).standalone === true);
  }
  
  return false;
};

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
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Load auth state on start
  useEffect(() => {
    loadAuthState();
    
    // Set up refresh interval for token if in standalone mode
    if (isRunningAsStandalone()) {
      const interval = setInterval(() => {
        const now = Date.now();
        // Only refresh if last refresh was more than 5 minutes ago
        if (now - lastRefresh > 5 * 60 * 1000) {
          refreshAuth().catch(() => {
            console.log('Background token refresh failed');
          });
        }
      }, 60 * 1000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [lastRefresh]);

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
        
        // If in standalone mode, try to refresh the token to ensure it's valid
        if (isRunningAsStandalone()) {
          refreshAuth().catch(() => {
            console.log('Initial token refresh failed');
          });
        }
      } else {
        console.log('No stored auth credentials found');
        
        // If running as standalone PWA, route to login page automatically
        if (isRunningAsStandalone() && Platform.OS === 'web') {
          setTimeout(() => {
            router.replace('/screens/auth/login');
          }, 500);
        }
      }
    } catch (error) {
      errorService.handleError(error, {
        source: 'auth',
        displayToUser: false,
        context: { action: 'loadAuthState' }
      });
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<boolean> => {
    try {
      // Only refresh if we have a token
      if (!token) return false;
      
      // Call API to refresh token
      const response = await api.auth.refreshToken();
      
      if (response.success && response.token) {
        // Store new tokens
        await storeAuthTokens(
          response.token,
          response.expiresIn || undefined,
          response.refreshToken || undefined
        );
        
        // Update state
        setToken(response.token);
        if (response.user) {
          setUser(response.user);
          await storage.setObject(STORAGE_KEYS.USER, response.user);
        }
        
        setLastRefresh(Date.now());
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Token refresh failed:', error);
      
      // If the refresh fails and we're in standalone mode, don't log out automatically
      // This prevents PWA users from being logged out due to network issues
      if (!isRunningAsStandalone()) {
        await clearAuthState();
      }
      
      return false;
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
      errorService.handleError(error, {
        source: 'auth',
        displayToUser: false,
        context: { action: 'clearAuthState' }
      });
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
      setLastRefresh(Date.now());
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error) {
      errorService.handleError(error, {
        source: 'auth',
        level: 'error',
        context: { action: 'processAuthResponse' }
      });
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
      errorService.handleError(error, {
        source: 'auth',
        level: 'error',
        context: { action: 'login', email }
      });
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
      errorService.handleError(error, {
        source: 'auth',
        level: 'error',
        context: { action: 'register', email: userData.email }
      });
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
          errorService.handleError(error, {
            source: 'auth',
            level: 'warning',
            displayToUser: false,
            context: { action: 'serverLogout' }
          });
        }
      }
      
      // Clear local state
      await clearAuthState();
      
      // Handle PWA back to login differently
      if (Platform.OS === 'web') {
        // If in standalone mode, navigate within the app
        if (isRunningAsStandalone()) {
          router.replace('/screens/auth/login');
        } else {
          window.location.href = '/screens/auth/login';
        }
      } else {
        router.replace('/screens/auth/login');
      }
    } catch (error) {
      errorService.handleError(error, {
        source: 'auth',
        context: { action: 'logout' }
      });
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
    logout,
    refreshAuth
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
