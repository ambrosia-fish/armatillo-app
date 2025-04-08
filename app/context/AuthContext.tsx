import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { storeAuthTokens, clearAuthTokens } from '../utils/tokenUtils';
import api from '../services/api';
import { errorService } from '../services/ErrorService';

interface User {
  id: string;
  email: string;
  displayName: string;
  username?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      // First try to load from AsyncStorage (works for both native and web)
      let storedToken = await storage.getItem(STORAGE_KEYS.TOKEN);
      let storedUser = await storage.getObject<User>(STORAGE_KEYS.USER);
      
      // If on web and tokens not found in AsyncStorage, check localStorage directly
      if (Platform.OS === 'web' && (!storedToken || !storedUser)) {
        const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (localToken) {
          storedToken = localToken;
          // Also make sure it's available in AsyncStorage
          await storage.setItem(STORAGE_KEYS.TOKEN, localToken);
        }
        
        const localUserJson = localStorage.getItem(STORAGE_KEYS.USER);
        if (localUserJson) {
          try {
            storedUser = JSON.parse(localUserJson);
            // Also make sure it's available in AsyncStorage
            await storage.setObject(STORAGE_KEYS.USER, storedUser);
          } catch (parseError) {
            console.error('Failed to parse user from localStorage:', parseError);
          }
        }
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        
        if (storedUser.displayName) {
          await storage.setItem(STORAGE_KEYS.USER_NAME, storedUser.displayName);
        }
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'loadAuthState' }
      });
      await clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      // Pass empty string to refreshToken if required
      const response = await api.auth.refreshToken('');
      
      if (response?.success && response?.token) {
        await storeAuthTokens(
          response.token,
          response.expiresIn,
          response.refreshToken
        );
        
        setToken(response.token);
        
        if (response.user) {
          setUser(response.user);
          await storage.setObject(STORAGE_KEYS.USER, response.user);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'warning',
        displayToUser: false,
        context: { action: 'refreshAuth' }
      });
      await clearAuthState();
      return false;
    }
  };

  const clearAuthState = async () => {
    try {
      // Clear tokens using the clearAuthTokens utility
      await clearAuthTokens();
      
      // For web, directly clear localStorage as a fallback
      if (Platform.OS === 'web') {
        // Force clear all auth-related items from localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);
        console.log('Web localStorage cleared'); // Debug log
      }
      
      // Update state
      setToken(null);
      setUser(null);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        displayToUser: false,
        context: { action: 'clearAuthState' }
      });
      
      // Even if we get an error, still try to update local state
      setToken(null);
      setUser(null);
    }
  };

  const processAuthResponse = async (authResponse: AuthResponse) => {
    try {
      const { success, token, user, expiresIn, refreshToken } = authResponse;
      
      if (!success || !token || !user) {
        throw new Error('Invalid authentication response');
      }
      
      await storeAuthTokens(token, expiresIn, refreshToken);
      await storage.setObject(STORAGE_KEYS.USER, user);
      
      // For web platform, ensure localStorage is also set directly
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        if (expiresIn) {
          const expiryTime = Date.now() + expiresIn * 1000;
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
        }
      }
      
      setToken(token);
      setUser(user);
      
      router.replace('/(tabs)/index');
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        level: 'error',
        context: { action: 'processAuthResponse' }
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(email, password);
      await processAuthResponse(response);
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
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

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.auth.register(userData);
      
      if (response?.success) {
        if (response.token && response.user) {
          await processAuthResponse(response);
          return response;
        }
        
        Alert.alert('Success', 'Account created successfully! Please log in.');
      }
      
      return response;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
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

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (token) {
        try {
          await api.auth.logout();
        } catch (error) {
          // Don't let server errors prevent client-side logout
          errorService.handleError(error instanceof Error ? error : String(error), {
            source: 'auth',
            level: 'warning',
            displayToUser: false,
            context: { action: 'serverLogout' }
          });
        }
      }
      
      // Clear all auth state
      await clearAuthState();
      
      // Force immediate navigation to login screen
      if (Platform.OS === 'web') {
        // For web, try to force a clean navigation
        window.location.href = '/';
      } else {
        // For native, use the router
        router.replace('/');
      }
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : String(error), {
        source: 'auth',
        context: { action: 'logout' }
      });
      
      // Still try to navigate to login even if there was an error
      router.replace('/screens/auth/login');
      
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default { AuthProvider, useAuth };